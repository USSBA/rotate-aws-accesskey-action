const core = require("@actions/core");
const github = require("@actions/github");
const sleep = require("thread-sleep");
const { request } = require("@octokit/request");
const sodium = require("tweetsodium");
const AWS = require("awssdk");

const ACCESS_KEY_ID = core.getInput("accessKeyId");
const SECRET_KEY = core.getInput("secretKey");
const REGION = core.getInput("region");
const ACCESS_KEY_ID_SECRET_NAME = core.getInput("accessKeyIdSecretName");
const SECRET_KEY_SECRET_NAME = core.getInput("secretKeySecretName");
const OWNER = core.getInput("owner");
const REPO = core.getInput("repo");
const TOKEN = core.getInput("token");

AWS.config = new AWS.Config();
AWS.config.accessKeyId = ACCESS_KEY_ID;
AWS.config.secretAccessKey = SECRET_KEY;
AWS.config.region = REGION;

async function getEncryptionKey() {
  var result = await request(
    "GET /repos/{owner}/{repo}/actions/secrets/public-key",
    {
      headers: {
        authorization: `token ${TOKEN}`,
      },
      owner: OWNER,
      repo: REPO,
    }
  );
  return {
    id: result.data.key_id,
    secret: result.data.key,
  };
}

function encrypt(secret, plaintext) {
  var data = sodium.seal(Buffer.from(plaintext), Buffer.from(secret, "base64"));
  return Buffer.from(data).toString("base64");
}

async function putSecret(key, name, value) {
  var r = await request("PUT /repos/{owner}/{repo}/actions/secrets/{secret}", {
    headers: {
      authorization: `token ${TOKEN}`,
    },
    owner: OWNER,
    repo: REPO,
    secret: name,
    encrypted_value: encrypt(key.secret, value),
    key_id: key.id,
  });
}

async function createAccessKey() {
  var iam = new AWS.IAM();
  var result = await iam.createAccessKey({});
  return {
    id: result.AccessKey.AccessKeyId,
    secret: result.AccessKey.SecretAccessKey,
  };
}

async function removeAccessKey() {
  var iam = new AWS.IAM();
  var r = await iam.deleteAccessKey({ AccessKeyId: ACCESS_KEY_ID });
}

try {
  // pull the encryption key from the repo
  var encryptionKey = await getEncryptionKey();

  // create a new access key
  var accessKey = await createAccessKey();
  sleep(5000);

  // update access key id
  putSecret(encryptionKey, ACCESS_KEY_ID_SECRET_NAME, accessKey.id);

  // update secret key
  putSecret(encryptionKey, SECRET_KEY_SECRET_NAME, accessKey.secret);

  // reconfigure the SDK credentials
  AWS.config = new AWS.Config();
  AWS.config.accessKeyId = accessKey.id;
  AWS.config.secretAccessKey = accessKey.secret;
  AWS.config.region = REGION;

  // remove previous access key
  removeAccessKey();
} catch (error) {
  console.log(error.message);
}

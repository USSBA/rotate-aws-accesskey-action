const AWS = require("aws-sdk");
const core = require("@actions/core");
const github = require("@actions/github");
const sodium = require("tweetsodium");
const sleep = require("thread-sleep");
const octokit = github.getOctokit(core.getInput("token"));

async function infoLog(message) {
  await core.info(message);
}

function encrypt(key, text) {
  var data = sodium.seal(Buffer.from(text), Buffer.from(key, "base64"));
  return Buffer.from(data).toString("base64");
}

async function getPublicKey(owner, repo) {
  try {
    var result = await octokit.request(
      "GET /repos/{owner}/{repo}/actions/secrets/public-key",
      {
        owner: owner,
        repo: repo,
      }
    );
    return result.data;
  } catch (error) {
    core.error(error.message);
    core.setFailed("Could not get the repository public key");
  }
}

async function putSecret(name, value, owner, repo) {
  try {
    var key = await getPublicKey(owner, repo);
    var result = await octokit.request(
      "PUT /repos/{owner}/{repo}/actions/secrets/{secret}",
      {
        owner: owner,
        repo: repo,
        secret: name,
        encrypted_value: encrypt(key.key, value),
        key_id: key.key_id,
      }
    );
  } catch (error) {
    core.error(error.message);
    core.setFailed("Could not PUT secret");
  }
}

async function createAccessKey(accessKeyId, secretAccessKey, region) {
  try {
    let AWS = require("aws-sdk");
    infoLog("setting aws credentials");
    AWS.config = new AWS.Config();
    AWS.config.accessKeyId = accessKeyId;
    AWS.config.secretAccessKey = secretAccessKey;
    AWS.config.region = region;
    var iam = new AWS.IAM();
    var result = await iam.createAccessKey().promise();
    return result.AccessKey;
  } catch (error) {
    core.error(error.message);
    core.setFailed("Could not create a new access key");
  }
}

async function deleteAccessKey(
  accessKeyId,
  secretAccessKey,
  region,
  targetAccessKeyId
) {
  try {
    let AWS = require("aws-sdk");
    infoLog("setting aws credentials");
    AWS.config = new AWS.Config();
    AWS.config.accessKeyId = accessKeyId;
    AWS.config.secretAccessKey = secretAccessKey;
    AWS.config.region = region;
    var iam = new AWS.IAM();
    var r = await iam
      .deleteAccessKey({ AccessKeyId: targetAccessKeyId })
      .promise();
  } catch (error) {
    core.error(error.message);
    core.setFailed("Could not delete access key");
  }
}

async function run() {
  infoLog("initialize");
  const fqrn = core.getInput("repo");
  const owner = fqrn.split("/")[0];
  const repo = fqrn.split("/")[1];
  const accessKeyId = core.getInput("accessKeyId");
  const secretAccessKey = core.getInput("secretKey");
  const region = core.getInput("region");
  const accessKeyIdSecretName = core.getInput("accessKeyIdSecretName");
  const secretKeySecretName = core.getInput("secretKeySecretName");

  infoLog("creating a new access key");
  var accessKey = await createAccessKey(accessKeyId, secretAccessKey, region);
  var newAccessKeyId = accessKey.AccessKeyId;
  var newSecretAccessKey = accessKey.SecretAccessKey;

  infoLog(`updateing sercret ${accessKeyIdSecretName}`);
  await putSecret(accessKeyIdSecretName, newAccessKeyId, owner, repo);

  infoLog(`updateing sercret ${secretKeySecretName}`);
  await putSecret(secretKeySecretName, newSecretAccessKey, owner, repo);

  infoLog("waiting 10 seconds");
  sleep(10 * 1000);

  infoLog("removing old access key");
  await deleteAccessKey(
    newAccessKeyId,
    newSecretAccessKey,
    region,
    accessKeyId
  );
}

run();

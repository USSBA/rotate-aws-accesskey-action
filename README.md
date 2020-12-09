# rotate-aws-accesskey-action (javascript action)

This action will rotate AWS access keys and update the repository secrets accordingly.

## Inputs

### `token`

**Required** A github token with permissions to overwrite secrets for the repo.

### `repo`

**Required** The fully qualified repository name.

### `accessKeyId`

**Required** The AWS access key id that will be rotated.

### `secretKey`

**Required** The AWS secret key, associated with the `accessKeyId`, that will be rotated.

### `region`

**Not Required** An AWS region.

**Default** us-east-1

### `accessKeyIdSecretName`

**Not Required** The name of your GitHub secret containing your AWS access key id.

**Default** `AWS_ACCESS_KEY_ID`

### `secretKeySecretName`

**Not Required** The name of your GitHub secret containing your AWS secret access key.

**Default** `AWS_SECRET_ACCESS_KEY`

## Outputs

This repository does not use any outputs.

## Example Usage

```
name: Main
on:
  schedule:
  - cron: "0 0 */1 * *"

jobs:
  access_key_rotation:
    runs-on: ubuntu-latest
    name: Access Key
    steps:
    - name: rotate
      id: rotate
      uses: ussba/rotate-aws-accesskey-action@v1.0.0
      with:
        token: ${{ secrets.TOKEN }}                       # cannot use secrets.GITHUB_TOKEN as it does not have the appropriate permissions to modify secrets
        repo: ${{ github.repository }}                    # ussba/rotate-aws-accesskey-action
        accessKeyId: ${{ secrets.AWS_ACCESS_KEY_ID }}
        secretKey: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## IAM Policy

The minimum IAM policy required for an IAM user to rotate their own AccessKey.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ManageOwnAccessKeys",
            "Effect": "Allow",
            "Action": [
                "iam:CreateAccessKey",
                "iam:DeleteAccessKey",
                "iam:GetAccessKeyLastUsed",
                "iam:GetUser",
                "iam:ListAccessKeys",
                "iam:UpdateAccessKey"
            ],
            "Resource": "arn:aws:iam::*:user/${aws:username}"
        }
    ]
}
```


## Reference Documentation
https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action
https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/metadata-syntax-for-github-actions
https://docs.github.com/en/free-pro-team@latest/rest/reference/actions#create-or-update-a-repository-secret
https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow#about-the-github_token-secret
https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#onschedule
https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html

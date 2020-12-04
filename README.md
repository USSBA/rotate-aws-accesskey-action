# rotate-aws-accesskey-action (javascript action)

This action prints "Hello World" or "Hello" + the name of a person to greet to the log.

## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

uses: actions/hello-world-javascript-action@v1.1
with:
  who-to-greet: 'Mona the Octocat'







## Reference Documentation
https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/creating-a-javascript-action
https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/metadata-syntax-for-github-actions
https://docs.github.com/en/free-pro-team@latest/rest/reference/actions#create-or-update-a-repository-secret
https://docs.github.com/en/free-pro-team@latest/actions/reference/authentication-in-a-workflow#about-the-github_token-secret
https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#onschedule
https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html

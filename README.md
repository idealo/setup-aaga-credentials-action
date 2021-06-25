# setup-iam-bastion-credentials-action

This action configures the environment with credentials retrieved from the [github-aws-trust-translator](https://github.com/idealo/github-aws-trust-translator).

## Usage

To use this in GitHub Actions you can add this snippet to your workflow job steps:

```yaml
- name: Get Bastion role creds
  uses: idealo/setup-iam-bastion-credentials-action@v0.1
  with:
    endpoint: <ENDPOINT-FROM-STACK-OUTPUT>
- name: Assume PoC deployment role
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-region: eu-central-1
    role-to-assume: <ROLE-YOU-WANT-TO-DEPLOY-WITH>
    role-skip-session-tagging: true
    role-duration-seconds: 900
```

The role that you want to assume needs to have its trust relationship set like so:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "<BASTION-ROLE-ARN-FROM-STACK-OUTPUT>"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/Repository": "<YOUR-REPO-NAME, e.g. idealo/sample-repo>"
        }
      }
    }
  ]
}
```

## Modes

This action supports two different modes of operation, which may be useful for different situations.

### env

The `env` mode will export temporary credentials for the bastion role into the environment.
This is the most compatible mode, as it is supported by (nearly) all tools, CLIs and SDKs.
You can assume your deployment role through other tooling, such as the official [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials) action.
However, credentials retrieved via this process can only be valid for a maximum of an hour (limit for role chaining) and must then be renewed by running the same actions again.

<details>
<summary>Sample usage with the env mode</summary>

```yaml
- name: Get Bastion role creds
  uses: idealo/setup-iam-bastion-credentials-action@v0.1
  with:
    endpoint: <ENDPOINT-FROM-STACK-OUTPUT>
- name: Assume PoC deployment role
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-region: eu-central-1
    role-to-assume: <ROLE-YOU-WANT-TO-DEPLOY-WITH>
    role-skip-session-tagging: true
    role-duration-seconds: 900
```
</details>

<details>
<summary>Sample usage with the env mode and mTLS</summary>

```yaml
- name: Get Bastion role creds
  uses: idealo/setup-iam-bastion-credentials-action@v0
  with:
    endpoint: <ENDPOINT-FROM-STACK-OUTPUT>
    ca-certificate: ${{ secrets.AAGA_MTLS_CA }}
    client-certificate: ${{ secrets.AAGA_MTLS_CERTIFICATE }}
    client-key: ${{ secrets.AAGA_MTLS_KEY }}
- name: Assume PoC deployment role
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-region: eu-central-1
    role-to-assume: <ROLE-YOU-WANT-TO-DEPLOY-WITH>
    role-skip-session-tagging: true
    role-duration-seconds: 900
```
</details>

### config

The `config` mode will prepare an `~/.aws/config` file that can retrieve bastion credentials and assume a target role with them.
The benefit of using this mode is that it allows auto-renewal of credentials, which makes long-running processes more viable.
For example, this would make Terraform apply runs that may exceed an hour of runtime possible.
This setup is supported by most SDKs and tools, but not all.

In order to have access for creating credentials, each action that may access AWS must have `GITHUB_TOKEN` in its environment (`env`).

<details>
<summary>Sample usage with the config mode</summary>

```yaml
- name: Get Bastion role creds
  uses: idealo/setup-iam-bastion-credentials-action@v0.1
  with:
    endpoint: <ENDPOINT-FROM-STACK-OUTPUT>
    mode: config
    role-to-assume: <ROLE-YOU-WANT-TO-DEPLOY-WITH>
- run: aws sts get-caller-identity --region eu-central-1
  env:
    GITHUB_TOKEN: ${{github.token}}
```
</details>

<details>
<summary>Sample usage with the config mode and mTLS</summary>

```yaml
- name: Get Bastion role creds
  uses: idealo/setup-iam-bastion-credentials-action@v0
  with:
    endpoint: <ENDPOINT-FROM-STACK-OUTPUT>
    mode: config
    role-to-assume: <ROLE-YOU-WANT-TO-DEPLOY-WITH>
- run: aws sts get-caller-identity --region eu-central-1
  env:
    GITHUB_TOKEN: ${{github.token}}
    AAGA_MTLS_CA: ${{ secrets.AAGA_MTLS_CA }}
    AAGA_MTLS_CERTIFICATE: ${{ secrets.AAGA_MTLS_CERTIFICATE }}
    AAGA_MTLS_KEY: ${{ secrets.AAGA_MTLS_KEY }}
```
</details>

## Developer Guide

### Publishing to a distribution branch

Actions are run from GitHub repos, so the packed dist folder is generated on commit and checked in automatically.
This project aims to follow the official [versioning guidelines](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md).

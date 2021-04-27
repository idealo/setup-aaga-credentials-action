# setup-iam-bastion-credentials-action

This action configures the environment with credentials retrieved from the [github-aws-trust-translator](https://github.com/idealo/github-aws-trust-translator).

## Usage

To use this in GitHub Actions you can add this snippet to your workflow job steps:

```yaml
- name: Get Bastion role creds
  uses: idealo/setup-iam-bastion-credentials-action@v0
  with:
    token: ${{github.token}}
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

## Developer Guide

### Publishing to a distribution branch

Actions are run from GitHub repos, so the packed dist folder is generated on commit and checked in automatically.
This project aims to follow the official [versioning guidelines](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md).

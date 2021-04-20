import * as core from '@actions/core'
import * as github from '@actions/github'
import * as rm from 'typed-rest-client/RestClient'

interface AwsCreds {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  region: string
}

async function run(): Promise<void> {
  const client = new rm.RestClient('actions')

  const creds = await client.create<AwsCreds>(core.getInput('endpoint'), null, {
    additionalHeaders: {
      Authorization: `Bearer ${core.getInput('token')}`,
      "github-repo-owner": github.context.repo.owner,
      "github-repo-name": github.context.repo.repo,
      "github-run-id": github.context.runId,
      "github-run-number": github.context.runNumber
    }
  })

  core.setSecret(creds.result!.accessKeyId)
  core.exportVariable('AWS_ACCESS_KEY_ID', creds.result!.accessKeyId)

  core.setSecret(creds.result!.secretAccessKey)
  core.exportVariable('AWS_SECRET_ACCESS_KEY', creds.result!.secretAccessKey)

  core.setSecret(creds.result!.sessionToken)
  core.exportVariable('AWS_SESSION_TOKEN', creds.result!.sessionToken)

  core.exportVariable('AWS_DEFAULT_REGION', creds.result!.region)
  core.exportVariable('AWS_REGION', creds.result!.region)
}

run()

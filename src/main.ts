import * as core from '@actions/core'
import * as github from '@actions/github'
import * as rm from 'typed-rest-client/RestClient'

interface AwsCreds {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  region: string
}

function exportCreds(creds: AwsCreds): void {
  core.setSecret(creds.accessKeyId)
  core.exportVariable('AWS_ACCESS_KEY_ID', creds.accessKeyId)

  core.setSecret(creds.secretAccessKey)
  core.exportVariable('AWS_SECRET_ACCESS_KEY', creds.secretAccessKey)

  core.setSecret(creds.sessionToken)
  core.exportVariable('AWS_SESSION_TOKEN', creds.sessionToken)

  core.exportVariable('AWS_DEFAULT_REGION', creds.region)
  core.exportVariable('AWS_REGION', creds.region)
}

async function run(): Promise<void> {
  const client = new rm.RestClient('actions')

  try {
    const creds = await client.create<AwsCreds>(core.getInput('endpoint'), null, {
      additionalHeaders: {
        Authorization: `Bearer ${core.getInput('token')}`,
        "github-repo-owner": github.context.repo.owner,
        "github-repo-name": github.context.repo.repo,
        "github-run-id": github.context.runId,
        "github-run-number": github.context.runNumber
      }
    })

    if (creds.result == null) {
      core.setFailed('No result returned from endpoint')
      return
    }

    exportCreds(creds.result)
  } catch (e) {
    core.setFailed(e)
  }
}

run()

import * as core from '@actions/core'
import * as github from '@actions/github'
import {AwsCreds, TranslatorClient} from './translator-client'

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
  const translatorClient = new TranslatorClient()

  try {
    const creds = await translatorClient.retrieveCreds(
      core.getInput('endpoint', {required: true}),
      {
        token: core.getInput('token'),
        repoOwner: github.context.repo.owner,
        repoName: github.context.repo.repo,
        runId: github.context.runId,
        runNumber: github.context.runNumber
      }
    )
    exportCreds(creds)
  } catch (e) {
    core.setFailed(e)
  }
}

run()

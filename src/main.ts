import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import TranslatorClient, {AwsCreds} from './translator-client'
import path from 'path'
import * as fs from 'fs'

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

async function writeConfigFile(
  endpoint: string,
  role: string,
  externalId: string
): Promise<void> {
  const scriptPath = path.resolve(
    __dirname,
    '..',
    'config-credentials',
    'index.js'
  )
  const config = `
[default]
source_profile = bastion
role_arn = ${role}
${externalId ? 'external_id = ' + externalId : ''}

[profile bastion]
credential_process = ${process.execPath} ${scriptPath} ${endpoint}`.trim()

  const configFile = `${process.env.HOME}/.aws/config`
  const configDir = path.dirname(configFile)

  core.debug(`Creating ${configDir}`)
  await io.mkdirP(configDir)

  core.debug(`Setting up ${configFile}`)
  await fs.promises.writeFile(configFile, config)
}

async function run(): Promise<void> {
  try {
    const endpoint = core.getInput('endpoint', {required: true})

    switch (core.getInput('mode')) {
      case 'env':
        const translatorClient = new TranslatorClient()
        const creds = await translatorClient.retrieveCreds(endpoint, {
          token: core.getInput('token'),
          repoOwner: github.context.repo.owner,
          repoName: github.context.repo.repo,
          runId: github.context.runId,
          runNumber: github.context.runNumber
        })
        exportCreds(creds)
        break
      case 'config':
        const role = core.getInput('role-to-assume', {required: true})
        const externalId = core.getInput('role-external-id')
        await writeConfigFile(endpoint, role, externalId)
        break
      default:
        core.setFailed(`Mode ${core.getInput('mode')} is not supported`)
    }
  } catch (e) {
    core.setFailed(e)
  }
}

run()

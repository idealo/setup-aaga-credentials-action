import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import {AuthContext, AwsCreds, TranslatorClient} from './translator-client'
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
  role: string,
  endpoint: string,
  ctx: AuthContext
): Promise<void> {
  const scriptPath = path.resolve(
    __dirname,
    '..',
    'config-credentials',
    'index.js'
  )
  const config = `
[profile bastion]
credential_process = "${process.execPath}" "${scriptPath}" "${endpoint}" "${ctx.token}" "${ctx.repoOwner}" "${ctx.repoName}" "${ctx.runId}" "${ctx.runNumber}"
  
[profile default]
role_arn = ${role}
source_profile = bastion`.trim()

  const configFile = `${process.env.HOME}/.aws/config`
  const configDir = path.dirname(configFile)

  core.debug(`Creating ${configDir}`)
  await io.mkdirP(configDir)

  core.debug(`Setting up ${configFile}`)
  await fs.promises.writeFile(configFile, config)
}

async function run(): Promise<void> {
  const authContext = {
    token: core.getInput('token'),
    repoOwner: github.context.repo.owner,
    repoName: github.context.repo.repo,
    runId: github.context.runId,
    runNumber: github.context.runNumber
  }

  try {
    const endpoint = core.getInput('endpoint', {required: true})

    switch (core.getInput('mode')) {
      case 'env':
        const translatorClient = new TranslatorClient()
        const creds = await translatorClient.retrieveCreds(
          endpoint,
          authContext
        )
        exportCreds(creds)
        break
      case 'config':
        const role = core.getInput('role-to-assume', {required: true})
        await writeConfigFile(role, endpoint, authContext)
        break
      default:
        core.setFailed(`Mode ${core.getInput('mode')} is not supported`)
    }
  } catch (e) {
    core.setFailed(e)
  }
}

run()

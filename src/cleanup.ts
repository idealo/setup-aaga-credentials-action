import * as core from '@actions/core'

async function cleanup(): Promise<void> {
  core.exportVariable('AWS_ACCESS_KEY_ID', '')
  core.exportVariable('AWS_SECRET_ACCESS_KEY', '')
  core.exportVariable('AWS_SESSION_TOKEN', '')
  core.exportVariable('AWS_DEFAULT_REGION', '')
  core.exportVariable('AWS_REGION', '')
}

cleanup()

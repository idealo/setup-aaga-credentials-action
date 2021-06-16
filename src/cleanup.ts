import * as core from '@actions/core'
import * as io from '@actions/io'

async function cleanup(): Promise<void> {
  switch (core.getInput('mode')) {
    case 'env':
      core.exportVariable('AWS_ACCESS_KEY_ID', '')
      core.exportVariable('AWS_SECRET_ACCESS_KEY', '')
      core.exportVariable('AWS_SESSION_TOKEN', '')
      core.exportVariable('AWS_DEFAULT_REGION', '')
      core.exportVariable('AWS_REGION', '')
      break
    case 'config':
      await io.rmRF(`${process.env.HOME}/.aws`)
      break
  }
}

cleanup()

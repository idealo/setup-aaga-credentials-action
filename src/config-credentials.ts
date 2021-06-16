import {TranslatorClient} from './translator-client'
import * as github from '@actions/github'

const args = process.argv.slice(2)
const client = new TranslatorClient()

async function run() {
  const creds = await client.retrieveCreds(args[0], {
    token: process.env.GITHUB_TOKEN || '',
    repoOwner: github.context.repo.owner,
    repoName: github.context.repo.repo,
    runId: github.context.runId,
    runNumber: github.context.runNumber
  })

  console.log(
    JSON.stringify({
      Version: 1,
      AccessKeyId: creds.accessKeyId,
      SecretAccessKey: creds.secretAccessKey,
      SessionToken: creds.sessionToken,
      Expiration: creds.expiration
    })
  )
}

run()

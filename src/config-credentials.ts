import {TranslatorClient} from './translator-client'

const args = process.argv.slice(2)
const client = new TranslatorClient()

async function run() {
  const creds = await client.retrieveCreds(args[0], {
    token: args[1],
    repoOwner: args[2],
    repoName: args[3],
    runId: parseInt(args[4]),
    runNumber: parseInt(args[5])
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

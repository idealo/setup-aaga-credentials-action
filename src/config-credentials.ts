import TranslatorClient from './translator-client'
import * as github from '@actions/github'
import * as flatCache from 'flat-cache'
import path from 'path'
import {Cache} from 'flat-cache'

const CREDENTIALS_CACHE_KEY = 'credentials'

interface CredentialProcessOutput {
  Version: number
  AccessKeyId: string
  SecretAccessKey: string
  SessionToken: string
  Expiration: string
}

async function retrieveCredentials(): Promise<CredentialProcessOutput> {
  const args = process.argv.slice(2)
  const client = new TranslatorClient()

  const credentials = await client.retrieveCreds(args[0], {
    token: process.env.GITHUB_TOKEN || '',
    repoOwner: github.context.repo.owner,
    repoName: github.context.repo.repo,
    runId: github.context.runId,
    runNumber: github.context.runNumber
  })

  return {
    Version: 1,
    AccessKeyId: credentials.accessKeyId,
    SecretAccessKey: credentials.secretAccessKey,
    SessionToken: credentials.sessionToken,
    Expiration: credentials.expiration
  }
}

function loadCachedCredentials(
  cache: Cache
): CredentialProcessOutput | undefined {
  const credentials = cache.getKey(CREDENTIALS_CACHE_KEY) as
    | CredentialProcessOutput
    | undefined

  if (credentials != undefined) {
    const expiration = Date.parse(credentials.Expiration)

    if (Date.now() < expiration) {
      return credentials
    } else {
      cache.removeKey(CREDENTIALS_CACHE_KEY)
    }
  }

  return undefined
}

function saveCredentialCache(
  cache: Cache,
  credentials: CredentialProcessOutput
): void {
  cache.setKey(CREDENTIALS_CACHE_KEY, credentials)
  cache.save()
}

export async function run(): Promise<void> {
  const cache = flatCache.load(
    'aws-bastion',
    path.resolve(`${process.env.HOME}/.aws`)
  )

  try {
    let credentials = loadCachedCredentials(cache)
    if (credentials == undefined) {
      credentials = await retrieveCredentials()
      saveCredentialCache(cache, credentials)
    }

    console.log(JSON.stringify(credentials))
  } catch (e) {
    console.error(e)
  }
}

if (require.main === module) {
  run()
}

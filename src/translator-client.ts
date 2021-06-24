import axios from 'axios'
import * as Https from 'https'
import {AgentOptions} from 'https'

export interface AuthContext {
  token: string
  repoOwner: string
  repoName: string
  runId: number
  runNumber: number
}

export interface AwsCreds {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
  expiration: string
  region: string
}

type MtlsOptions = Pick<AgentOptions, 'cert' | 'key' | 'ca'>

export default class TranslatorClient {
  async retrieveCreds(
    endpoint: string,
    authContext: AuthContext,
    mtlsOptions?: MtlsOptions
  ): Promise<AwsCreds> {
    const response = await axios.post<AwsCreds>(endpoint, undefined, {
      headers: {
        Authorization: `Bearer ${authContext.token}`,
        'github-repo-owner': authContext.repoOwner,
        'github-repo-name': authContext.repoName,
        'github-run-id': authContext.runId,
        'github-run-number': authContext.runNumber
      },
      httpsAgent:
        mtlsOptions != undefined ? new Https.Agent(mtlsOptions) : undefined
    })

    return response.data
  }
}

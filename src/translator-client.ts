import axios from 'axios'
import * as Https from 'https'
import {AgentOptions} from 'https'
import * as tls from 'tls'

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

interface MtlsOptions {
  cert: string
  key: string
  ca: string
}

export default class TranslatorClient {
  async retrieveCreds(
    endpoint: string,
    authContext: AuthContext,
    mtlsOptions?: MtlsOptions
  ): Promise<AwsCreds> {
    let agentOptions: AgentOptions | null = null
    if (mtlsOptions != undefined) {
      agentOptions = {
        cert: mtlsOptions.cert,
        key: mtlsOptions.key,
        ca: [...tls.rootCertificates, mtlsOptions.ca]
      }
    }

    const response = await axios.post<AwsCreds>(endpoint, undefined, {
      headers: {
        Authorization: `Bearer ${authContext.token}`,
        'github-repo-owner': authContext.repoOwner,
        'github-repo-name': authContext.repoName,
        'github-run-id': authContext.runId,
        'github-run-number': authContext.runNumber
      },
      httpsAgent:
        agentOptions != null ? new Https.Agent(agentOptions) : undefined
    })

    return response.data
  }
}

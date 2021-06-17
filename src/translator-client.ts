import * as rm from 'typed-rest-client'

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

export class TranslatorClient {
  private readonly client = new rm.RestClient('actions', undefined, undefined, {
    socketTimeout: 15 * 1000
  })

  async retrieveCreds(
    endpoint: string,
    authContext: AuthContext
  ): Promise<AwsCreds> {
    const response = await this.client.create<AwsCreds>(endpoint, null, {
      additionalHeaders: {
        Authorization: `Bearer ${authContext.token}`,
        'github-repo-owner': authContext.repoOwner,
        'github-repo-name': authContext.repoName,
        'github-run-id': authContext.runId,
        'github-run-number': authContext.runNumber
      }
    })

    if (response.result == null) {
      throw new Error('No result returned from endpoint')
    }

    return response.result
  }
}

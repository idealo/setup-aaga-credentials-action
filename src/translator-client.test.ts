import nock from 'nock'
import TranslatorClient from './translator-client'

describe('Translator Client', () => {
  const translatorClient = new TranslatorClient()
  const mockAuthContext = {
    token: 'abc',
    repoOwner: 'def',
    repoName: 'ghi',
    runId: 123,
    runNumber: 1
  }

  afterAll(() => {
    nock.restore()
  })

  it('should return credentials from endpoint', async () => {
    nock('https://some-api.amazonaws.com').post('/creds').reply(200, {
      accessKeyId: 'ABC',
      secretAccessKey: 'cdf',
      sessionToken: '123',
      region: 'eu-central-1'
    })

    const creds = await translatorClient.retrieveCreds(
      'https://some-api.amazonaws.com/creds',
      mockAuthContext
    )

    expect(creds.accessKeyId).toBe('ABC')
    expect(creds.secretAccessKey).toBe('cdf')
    expect(creds.sessionToken).toBe('123')
    expect(creds.region).toBe('eu-central-1')
  })

  it('should include the auth context request headers', async () => {
    const scope = nock('https://some-api.amazonaws.com', {
      reqheaders: {
        Authorization: 'Bearer abc',
        'github-repo-owner': 'def',
        'github-repo-name': 'ghi',
        'github-run-id': '123',
        'github-run-number': '1'
      }
    })
      .post('/creds')
      .reply(200, {
        accessKeyId: 'ABC',
        secretAccessKey: 'cdf',
        sessionToken: '123',
        region: 'eu-central-1'
      })

    await translatorClient.retrieveCreds(
      'https://some-api.amazonaws.com/creds',
      mockAuthContext
    )

    expect(scope.isDone()).toBeTruthy()
  })

  it('should throw if unauthorized', () => {
    nock('https://some-api.amazonaws.com').post('/creds').reply(401)

    return expect(
      translatorClient.retrieveCreds(
        'https://some-api.amazonaws.com/creds',
        mockAuthContext
      )
    ).rejects.toThrow('Request failed with status code 401')
  })
})

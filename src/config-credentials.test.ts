const mockRetrieveCreds = jest.fn().mockResolvedValue({})
jest.mock('./translator-client', () => {
  return jest.fn().mockImplementation(() => {
    return {retrieveCreds: mockRetrieveCreds}
  })
})

process.env.GITHUB_REPOSITORY = 'idealo/test-repo'
process.env.GITHUB_RUN_ID = '42'
process.env.GITHUB_RUN_NUMBER = '1337'

import {run} from './config-credentials'
import * as flatCache from 'flat-cache'

describe('Credential Process Script', () => {
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    flatCache.clearAll()
  })

  it('should call the translator with information from environment', async () => {
    process.argv = ['node', 'index.js', 'https://example.com']
    process.env.GITHUB_TOKEN = 'token'

    await run()

    expect(mockRetrieveCreds).toHaveBeenCalledWith('https://example.com', {
      token: 'token',
      repoOwner: 'idealo',
      repoName: 'test-repo',
      runId: 42,
      runNumber: 1337
    })
  })

  it('should return credentials in the CLI format', async () => {
    mockRetrieveCreds.mockResolvedValueOnce({
      accessKeyId: 'AK',
      secretAccessKey: 'SK',
      sessionToken: 'ST',
      expiration: new Date().toISOString(),
      region: 'eu-central-1'
    })

    await run()

    const output = JSON.parse(consoleSpy.mock.calls[0][0])

    expect(output.Version).toBe(1)
    expect(output.AccessKeyId).toBe('AK')
    expect(output.SecretAccessKey).toBe('SK')
    expect(output.SessionToken).toBe('ST')
    expect(Date.parse(output.Expiration)).toBeLessThanOrEqual(Date.now())
  })

  it('should return cached credentials on subsequent runs', async () => {
    const expiration = new Date()
    expiration.setHours(expiration.getHours() + 1)
    mockRetrieveCreds.mockResolvedValueOnce({
      accessKeyId: 'AK1',
      secretAccessKey: 'SK1',
      sessionToken: 'ST1',
      expiration: expiration.toISOString(),
      region: 'eu-central-1'
    })

    await run()
    await run()

    const output = JSON.parse(consoleSpy.mock.calls[1][0])

    expect(output.SecretAccessKey).toBe('SK1')
    expect(mockRetrieveCreds).toHaveBeenCalledTimes(1)
  })

  it('should retrieve new credentials if cached ones are expired', async () => {
    const expiration = new Date()
    expiration.setHours(expiration.getHours() - 1)
    mockRetrieveCreds
      .mockResolvedValueOnce({
        accessKeyId: 'AK2',
        secretAccessKey: 'SK2',
        sessionToken: 'ST2',
        expiration: expiration.toISOString(),
        region: 'eu-central-1'
      })
      .mockResolvedValueOnce({
        accessKeyId: 'AK3',
        secretAccessKey: 'SK3',
        sessionToken: 'ST3',
        expiration: new Date().toISOString(),
        region: 'eu-central-1'
      })

    await run()
    await run()

    const output1 = JSON.parse(consoleSpy.mock.calls[0][0])
    expect(output1.SecretAccessKey).toBe('SK2')

    const output2 = JSON.parse(consoleSpy.mock.calls[1][0])
    expect(output2.SecretAccessKey).toBe('SK3')

    expect(mockRetrieveCreds).toHaveBeenCalledTimes(2)
  })
})

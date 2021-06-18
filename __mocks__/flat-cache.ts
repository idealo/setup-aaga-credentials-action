import {mkdtempSync} from 'fs'
import path from 'path'
import * as os from 'os'

const actualFlatCache = jest.requireActual('flat-cache')
const cacheDir = mkdtempSync(path.join(os.tmpdir(), 'cache-'))

export = {
  ...actualFlatCache,
  load: jest.fn().mockImplementation(key => {
    return actualFlatCache.load(key, cacheDir)
  }),
  clearAll: jest.fn().mockImplementation(() => {
    actualFlatCache.clearAll(cacheDir)
  })
}

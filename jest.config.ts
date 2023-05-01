import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  verbose: true,
  testTimeout: 10000,
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}

export default jestConfig

import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx,js}'],
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
}

export default config

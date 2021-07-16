import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  collectCoverage: true,
};

export default config;

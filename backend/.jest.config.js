module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: ['<rootDir>/tests/**/*.(spec|test).js'],
  setupFilesAfterEnv: ['<rootDir>/tests/test_setup.js'],
  rootDir: '.',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ['text', 'html'],
};
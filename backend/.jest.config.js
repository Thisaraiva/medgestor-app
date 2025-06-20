module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/unit/**/*.unit.test.js',
    '<rootDir>/tests/integration/**/*.integration.test.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/test_setup.js'],
  rootDir: '.',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'html'],
};
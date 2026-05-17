// Configuration Jest pour les tests
const { jestConfig } = require('./config');

module.exports = {
  ...jestConfig,
  
  // Configuration spécifique aux tests
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Variables d'environnement pour les tests
  testEnvironmentOptions: {
    NODE_ENV: 'test',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'nodejs_project_test',
    JWT_SECRET: process.env.JWT_SECRET || 'test-secret-key-for-testing-only',
    JWT_EXPIRES_IN: '1h'
  },
  
  // Patterns de test
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  
  // Exclusions
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'database/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Rapports de coverage
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Seuils de coverage
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    './controllers/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './models/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Timeout et performance
  testTimeout: 30000,
  maxWorkers: process.env.CI ? 2 : '50%',
  
  // Rapporteurs
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}'
      }
    ]
  ],
  
  // Gestion des erreurs
  errorOnDeprecated: true,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  
  // Mocks et modules
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Transformation
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Modules à transformer
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)'
  ]
};

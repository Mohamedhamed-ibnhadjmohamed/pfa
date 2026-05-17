const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration des tests
const TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  parallel: true,
  coverage: true,
  reporters: ['spec', 'json']
};

// Scripts de test personnalisés
const TEST_SCRIPTS = {
  // Test rapide pour le développement
  quick: 'jest --testPathPattern=tests/unit.test.js --verbose',
  
  // Tests complets
  full: 'jest --testPathPattern=tests/ --verbose --coverage',
  
  // Tests d'intégration seulement
  integration: 'jest --testPathPattern=tests/integration.test.js --verbose',
  
  // Tests de charge seulement
  load: 'jest --testPathPattern=tests/load.test.js --verbose --maxWorkers=1',
  
  // Tests avec surveillance
  watch: 'jest --testPathPattern=tests/ --watch',
  
  // Tests avec coverage détaillé
  coverage: 'jest --testPathPattern=tests/ --coverage --coverageReporters=text-lcov | coveralls',
  
  // Tests de performance
  performance: 'jest --testPathPattern=tests/load.test.js --verbose --detectOpenHandles'
};

// Commandes de test
const TEST_COMMANDS = {
  // Nettoyer la base de données de test
  cleanDB: 'mysql -u root -p nodejs_project -e "DELETE FROM users WHERE email LIKE \'test%@example.com\' OR email = \'admin@nodejs-project.com\';"',
  
  // Créer l'utilisateur admin de test
  setupAdmin: 'mysql -u root -p nodejs_project -e "INSERT INTO users (firstName, lastName, email, password, oldmotp, role) VALUES (\'System\', \'Administrator\', \'admin@nodejs-project.com\', \'$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm\', \'admin123\', \'admin\') ON DUPLICATE KEY UPDATE role=role;"',
  
  // Vérifier la connexion à la base de données
  checkDB: 'mysql -u root -p -e "SELECT 1;"',
  
  // Linter du code
  lint: 'eslint controllers/ models/ database/ --ext .js',
  
  // Formatage du code
  format: 'prettier --write controllers/ models/ database/ tests/',
  
  // Vérifier les dépendances
  deps: 'npm audit --audit-level moderate',
  
  // Build pour production
  build: 'npm ci --only=production',
  
  // Vérifier les types (si TypeScript)
  types: 'tsc --noEmit'
};

// Fonctions utilitaires pour les tests
const TestHelpers = {
  // Créer un utilisateur de test
  createTestUser: async (userData) => {
    const User = require('../models/User');
    return await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'Password123!',
      ...userData
    });
  },

  // Nettoyer les données de test
  cleanupTestData: async () => {
    const db = require('../database/connection');
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
  },

  // Générer des données de test
  generateTestData: (count = 10) => {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        firstName: `Test${i}`,
        lastName: `User${i}`,
        email: `test${i}@example.com`,
        password: 'Password123!',
        phone: `+336123456${i.toString().padStart(2, '0')}`
      });
    }
    return users;
  },

  // Mesurer les performances
  measurePerformance: async (fn, iterations = 100) => {
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await fn();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convertir en ms
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
    };
  },

  // Simuler une charge utilisateur
  simulateUserLoad: async (concurrentUsers = 50, duration = 10000) => {
    const request = require('supertest');
    const app = require('../index');
    
    const promises = [];
    const endTime = Date.now() + duration;
    
    while (Date.now() < endTime) {
      for (let i = 0; i < concurrentUsers; i++) {
        promises.push(request(app).get('/api/test'));
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return await Promise.all(promises);
  }
};

// Configuration Jest
const jestConfig = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'database/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testTimeout: TEST_CONFIG.timeout,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true
};

// Scripts de test pour package.json
const packageScripts = {
  "test": "jest --config=tests/jest.config.js",
  "test:unit": "jest --testPathPattern=tests/unit.test.js --verbose",
  "test:integration": "jest --testPathPattern=tests/integration.test.js --verbose",
  "test:load": "jest --testPathPattern=tests/load.test.js --verbose --maxWorkers=1",
  "test:watch": "jest --testPathPattern=tests/ --watch",
  "test:coverage": "jest --config=tests/jest.config.js --coverage --coverageReporters=text-lcov | coveralls",
  "test:performance": "jest --testPathPattern=tests/load.test.js --verbose --detectOpenHandles",
  "test:quick": "jest --testPathPattern=tests/unit.test.js --verbose --maxWorkers=4",
  "test:full": "jest --config=tests/jest.config.js --verbose --coverage --maxWorkers=2",
  "test:ci": "jest --config=tests/jest.config.js --ci --coverage --watchAll=false"
};

// Configuration pour différents environnements
const environments = {
  development: {
    NODE_ENV: 'development',
    DB_NAME: 'nodejs_project_test',
    JWT_SECRET: 'test-secret-key',
    timeout: 30000
  },
  
  test: {
    NODE_ENV: 'test',
    DB_NAME: 'nodejs_project_test',
    JWT_SECRET: 'test-secret-key',
    timeout: 10000
  },
  
  ci: {
    NODE_ENV: 'test',
    DB_NAME: 'nodejs_project_ci',
    JWT_SECRET: 'ci-secret-key',
    timeout: 60000,
    parallel: false
  }
};

// Exporter la configuration
module.exports = {
  TEST_CONFIG,
  TEST_SCRIPTS,
  TEST_COMMANDS,
  TestHelpers,
  jestConfig,
  packageScripts,
  environments
};

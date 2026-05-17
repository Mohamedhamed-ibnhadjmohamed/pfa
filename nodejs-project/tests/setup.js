// Configuration globale pour les tests
const db = require('../database/connection');

// Variables globales pour les tests
global.testConfig = {
  timeout: 30000,
  retries: 2,
  cleanup: true
};

// Nettoyage de la base de données avant chaque test
beforeAll(async () => {
  console.log('🧪 Configuration des tests...');
  
  try {
    // Vérifier la connexion à la base de données
    await db.query('SELECT 1');
    console.log('✅ Connexion à la base de données établie');
    
    // Nettoyer les données de test précédentes
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
    console.log('🧹 Nettoyage des données de test');
    
    // Créer l'utilisateur admin par défaut
    await db.query(`
      INSERT INTO users (firstName, lastName, email, password, oldmotp, role) 
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE role=role
    `, [
      'System', 
      'Administrator', 
      'admin@nodejs-project.com', 
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 
      'admin123', 
      'admin'
    ]);
    console.log('👤 Utilisateur admin de test créé');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des tests:', error);
    process.exit(1);
  }
});

// Nettoyage après chaque test
afterEach(async () => {
  if (global.testConfig.cleanup) {
    try {
      // Nettoyer uniquement les données de test créées pendant les tests
      await db.query('DELETE FROM users WHERE email LIKE ?', ['test%@example.com']);
    } catch (error) {
      console.error('⚠️ Erreur lors du nettoyage après le test:', error);
    }
  }
});

// Nettoyage final après tous les tests
afterAll(async () => {
  console.log('🧹 Nettoyage final des tests...');
  
  try {
    // Nettoyer toutes les données de test
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
    console.log('✅ Données de test nettoyées');
    
    // Fermer la connexion à la base de données
    await db.end();
    console.log('🔌 Connexion à la base de données fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage final:', error);
  }
  
  console.log('🏁 Tests terminés');
});

// Gestion des timeouts
jest.setTimeout(global.testConfig.timeout);

// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

// Mock des modules externes si nécessaire
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((password) => `$2a$12$hashed_${password}`),
  compareSync: jest.fn((password, hash) => hash.includes(password)),
  genSaltSync: jest.fn(() => 12)
}));

// Utilitaires de test globaux
global.testUtils = {
  // Créer un utilisateur de test
  createTestUser: async (userData = {}) => {
    const User = require('../models/User');
    const defaultData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'user',
      ...userData
    };
    
    return await User.create(defaultData);
  },
  
  // Créer un admin de test
  createTestAdmin: async (userData = {}) => {
    const User = require('../models/User');
    const defaultData = {
      firstName: 'Test',
      lastName: 'Admin',
      email: `admin_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'admin',
      ...userData
    };
    
    return await User.create(defaultData);
  },
  
  // Générer un token de test
  generateTestToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  },
  
  // Attendre un certain temps
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Générer des données aléatoires
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Générer un email de test
  randomEmail: () => `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
  
  // Mesurer le temps d'exécution
  measureTime: async (fn) => {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convertir en ms
    
    return { result, duration };
  }
};

// Configuration des logs pour les tests
if (process.env.NODE_ENV === 'test') {
  // Désactiver les logs de production pendant les tests
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// Exporter la configuration
module.exports = {
  testConfig: global.testConfig,
  testUtils: global.testUtils
};

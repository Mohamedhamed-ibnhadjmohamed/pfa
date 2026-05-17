const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const db = require('../database/connection');

describe('Tests d\'Authentification', () => {
  let authToken = '';
  let testUserId = null;

  beforeAll(async () => {
    // Nettoyer la base de données de test
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
    
    // Créer l'utilisateur admin par défaut
    await db.query(`
      INSERT INTO users (firstName, lastName, email, password, oldmotp, role) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'System', 
      'Administrator', 
      'admin@nodejs-project.com', 
      '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 
      'admin123', 
      'admin'
    ]);
  });

  afterAll(async () => {
    // Nettoyer après les tests
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
    await db.end();
  });

  describe('POST /api/auth/login', () => {
    test('devrait connecter un admin avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@nodejs-project.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Connexion réussie');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'admin@nodejs-project.com');
      expect(response.body.user).toHaveProperty('role', 'admin');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('oldmotp');

      authToken = response.body.token;
    });

    test('devrait rejeter la connexion avec un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });

    test('devrait rejeter la connexion avec un mot de passe invalide', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@nodejs-project.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Email ou mot de passe incorrect');
    });

    test('devrait rejeter la connexion avec des données manquantes', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@nodejs-project.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Données invalides');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/register', () => {
    test('devrait inscrire un nouvel utilisateur avec des données valides', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'Password123!',
          phone: '+33612345678'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Inscription réussie');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('role', 'user');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('oldmotp');

      testUserId = response.body.user.id;
    });

    test('devrait rejeter l\'inscription avec un email déjà utilisé', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User2',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'Cet email est déjà utilisé');
    });

    test('devrait rejeter l\'inscription avec un mot de passe faible', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test2@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Données invalides');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: expect.stringContaining('mot de passe')
          })
        ])
      );
    });

    test('devrait rejeter l\'inscription avec un email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          password: 'Password123!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Données invalides');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Email invalide'
          })
        ])
      );
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('devrait rafraîchir un token valide', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Token rafraîchi');
      expect(response.body).toHaveProperty('token');
    });

    test('devrait rejeter un token invalide', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Token invalide');
    });

    test('devrait rejeter une requête sans token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token requis');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('devrait déconnecter un utilisateur', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Déconnexion réussie');
    });
  });
});

describe('Tests des Utilisateurs', () => {
  let authToken = '';
  let testUserId = null;

  beforeAll(async () => {
    // Connecter l'admin
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nodejs-project.com',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.token;

    // Créer un utilisateur de test
    const userResponse = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'Password123!'
      });
    
    testUserId = userResponse.body.user.id;
  });

  afterAll(async () => {
    // Nettoyer
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
    await db.end();
  });

  describe('GET /api/users', () => {
    test('devrait lister tous les utilisateurs avec authentification', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Utilisateurs récupérés avec succès');
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    test('devrait rejeter l\'accès sans authentification', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token requis');
    });
  });

  describe('GET /api/users/:id', () => {
    test('devrait récupérer un utilisateur par ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Utilisateur récupéré avec succès');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', testUserId);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('oldmotp');
    });

    test('devrait retourner 404 pour un ID inexistant', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Utilisateur non trouvé');
    });
  });

  describe('PUT /api/users/:id', () => {
    test('devrait mettre à jour un utilisateur', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'User',
          phone: '+33698765432'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Utilisateur mis à jour avec succès');
      expect(response.body.user).toHaveProperty('firstName', 'Updated');
      expect(response.body.user).toHaveProperty('phone', '+33698765432');
    });

    test('devrait rejeter la mise à jour avec des données invalides', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'A' // Moins de 2 caractères
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Données invalides');
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('devrait supprimer un utilisateur', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Utilisateur supprimé avec succès');
    });

    test('devrait retourner 404 pour la suppression d\'un utilisateur inexistant', async () => {
      const response = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Utilisateur non trouvé');
    });
  });
});

describe('Tests d\'Administration', () => {
  let adminToken = '';
  let userToken = '';
  let testUserId = null;

  beforeAll(async () => {
    // Connecter l'admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nodejs-project.com',
        password: 'admin123'
      });
    adminToken = adminLogin.body.token;

    // Créer un utilisateur normal
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Normal',
        lastName: 'User',
        email: 'normal@example.com',
        password: 'Password123!'
      });
    userToken = userResponse.body.token;
    testUserId = userResponse.body.user.id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE email LIKE ? OR email = ?', ['test%@example.com', 'admin@nodejs-project.com']);
    await db.end();
  });

  describe('GET /api/admin/users', () => {
    test('devrait lister les utilisateurs avec rôles pour un admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Utilisateurs récupérés avec succès');
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.users)).toBe(true);
      
      // Vérifier que les utilisateurs ont les propriétés de rôle
      const users = response.body.users;
      users.forEach(user => {
        expect(user).toHaveProperty('isAdmin');
        expect(user).toHaveProperty('isUser');
        expect(typeof user.isAdmin).toBe('boolean');
        expect(typeof user.isUser).toBe('boolean');
      });
    });

    test('devrait rejeter l\'accès pour un utilisateur normal', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Accès refusé - Admin requis');
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
    test('devrait mettre à jour le rôle d\'un utilisateur pour un admin', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Rôle utilisateur mis à jour avec succès');
      expect(response.body.user).toHaveProperty('role', 'admin');
      expect(response.body.user.isAdmin).toBe(true);
    });

    test('devrait rejeter la mise à jour de rôle pour un utilisateur normal', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'admin'
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Accès refusé - Admin requis');
    });

    test('devrait rejeter un rôle invalide', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${testUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'invalid-role'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Données invalides');
    });
  });

  describe('GET /api/admin/stats', () => {
    test('devrait retourner les statistiques pour un admin', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Statistiques utilisateurs récupérées avec succès');
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('admins');
      expect(response.body.stats).toHaveProperty('users');
      expect(response.body.stats).toHaveProperty('recentUsers');
      expect(typeof response.body.stats.total).toBe('number');
      expect(typeof response.body.stats.admins).toBe('number');
      expect(typeof response.body.stats.users).toBe('number');
    });

    test('devrait rejeter l\'accès aux stats pour un utilisateur normal', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Accès refusé - Admin requis');
    });
  });
});

describe('Tests de Sécurité', () => {
  let authToken = '';

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nodejs-project.com',
        password: 'admin123'
      });
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await db.query('DELETE FROM users WHERE email = ?', ['admin@nodejs-project.com']);
    await db.end();
  });

  describe('Protection contre les attaques', () => {
    test('devrait rejeter les requêtes sans token JWT', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token requis');
    });

    test('devrait rejeter les tokens JWT malformés', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer malformed-token');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message', 'Token invalide');
    });

    test('devrait exclure les mots de passe des réponses JSON', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.users.forEach(user => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('oldmotp');
      });
    });

    test('devrait avoir des en-têtes de sécurité', async () => {
      const response = await request(app)
        .get('/');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Rate Limiting', () => {
    test('devrait limiter le nombre de requêtes', async () => {
      // Faire beaucoup de requêtes rapidement
      const promises = Array(101).fill().map(() =>
        request(app).get('/api/test')
      );

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);
  });
});

describe('Tests des Endpoints Utilitaires', () => {
  test('GET /api/test devrait retourner un message de test', async () => {
    const response = await request(app)
      .get('/api/test');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'API fonctionne correctement!');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version', '1.0.0');
  });

  test('GET / devrait retourner les informations de l\'API', async () => {
    const response = await request(app)
      .get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('documentation');
    expect(response.body).toHaveProperty('endpoints');
    expect(response.body.documentation).toHaveProperty('swagger');
    expect(response.body.documentation).toHaveProperty('openapi');
  });

  test('devrait retourner 404 pour les routes inexistantes', async () => {
    const response = await request(app)
      .get('/api/route-inexistante');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Route non trouvée');
    expect(response.body).toHaveProperty('path');
  });
});

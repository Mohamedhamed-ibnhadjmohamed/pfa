const request = require('supertest');
const app = require('../index');

describe('Tests de Charge - API Performance', () => {
  let authToken = '';

  beforeAll(async () => {
    // Obtenir un token pour les tests authentifiés
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@nodejs-project.com',
        password: 'admin123'
      });
    
    authToken = loginResponse.body.token;
  });

  describe('Tests de Charge - Authentification', () => {
    test('devrait gérer 100 connexions simultanées', async () => {
      const concurrentRequests = 100;
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@nodejs-project.com',
            password: 'admin123'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Vérifier que toutes les requêtes ont réussi
      const successCount = responses.filter(res => res.status === 200).length;
      const failureCount = responses.filter(res => res.status !== 200).length;

      console.log(`\n📊 Test de charge - Connexions simultanées:`);
      console.log(`   Requêtes: ${concurrentRequests}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Échecs: ${failureCount}`);
      console.log(`   Durée: ${duration}ms`);
      console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

      expect(successCount).toBeGreaterThan(concurrentRequests * 0.95); // 95% de succès minimum
      expect(duration).toBeLessThan(10000); // Moins de 10 secondes
    }, 15000);

    test('devrait gérer 50 inscriptions simultanées', async () => {
      const concurrentRequests = 50;
      const promises = Array(concurrentRequests).fill().map((_, index) =>
        request(app)
          .post('/api/auth/register')
          .send({
            firstName: `User${index}`,
            lastName: `Test${index}`,
            email: `user${index}@loadtest.com`,
            password: 'Password123!'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successCount = responses.filter(res => res.status === 201).length;
      const failureCount = responses.filter(res => res.status !== 201).length;

      console.log(`\n📊 Test de charge - Inscriptions simultanées:`);
      console.log(`   Requêtes: ${concurrentRequests}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Échecs: ${failureCount}`);
      console.log(`   Durée: ${duration}ms`);
      console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

      expect(successCount).toBeGreaterThan(concurrentRequests * 0.90); // 90% de succès minimum
      expect(duration).toBeLessThan(15000); // Moins de 15 secondes
    }, 20000);
  });

  describe('Tests de Charge - Lecture de Données', () => {
    test('devrait gérer 200 requêtes GET /api/test simultanées', async () => {
      const concurrentRequests = 200;
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app).get('/api/test')
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successCount = responses.filter(res => res.status === 200).length;
      const avgResponseTime = responses.reduce((sum, res) => sum + res.headers['x-response-time'] || 0, 0) / responses.length;

      console.log(`\n📊 Test de charge - GET /api/test:`);
      console.log(`   Requêtes: ${concurrentRequests}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Durée totale: ${duration}ms`);
      console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

      expect(successCount).toBe(concurrentRequests); // 100% de succès
      expect(duration).toBeLessThan(5000); // Moins de 5 secondes
    }, 10000);

    test('devrait gérer 100 requêtes GET /api/users authentifiées simultanées', async () => {
      const concurrentRequests = 100;
      const promises = Array(concurrentRequests).fill().map(() =>
        request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successCount = responses.filter(res => res.status === 200).length;

      console.log(`\n📊 Test de charge - GET /api/users (authentifié):`);
      console.log(`   Requêtes: ${concurrentRequests}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Durée: ${duration}ms`);
      console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

      expect(successCount).toBeGreaterThan(concurrentRequests * 0.95); // 95% de succès minimum
      expect(duration).toBeLessThan(8000); // Moins de 8 secondes
    }, 12000);
  });

  describe('Tests de Charge - Écriture de Données', () => {
    test('devrait gérer 50 créations d\'utilisateurs simultanées', async () => {
      const concurrentRequests = 50;
      const promises = Array(concurrentRequests).fill().map((_, index) =>
        request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: `Load${index}`,
            lastName: `Test${index}`,
            email: `loadtest${index}@example.com`,
            password: 'Password123!'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successCount = responses.filter(res => res.status === 201).length;

      console.log(`\n📊 Test de charge - POST /api/users:`);
      console.log(`   Requêtes: ${concurrentRequests}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Durée: ${duration}ms`);
      console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

      expect(successCount).toBeGreaterThan(concurrentRequests * 0.90); // 90% de succès minimum
      expect(duration).toBeLessThan(15000); // Moins de 15 secondes
    }, 20000);
  });

  describe('Tests de Charge - Rate Limiting', () => {
    test('devrait activer le rate limiting après 100 requêtes', async () => {
      const requests = [];
      
      // Faire 105 requêtes (5 au-dessus de la limite)
      for (let i = 0; i < 105; i++) {
        requests.push(request(app).get('/api/test'));
      }

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter(res => res.status === 429).length;
      const successCount = responses.filter(res => res.status === 200).length;

      console.log(`\n📊 Test de charge - Rate Limiting:`);
      console.log(`   Requêtes totales: ${responses.length}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Limitées: ${rateLimitedCount}`);

      expect(rateLimitedCount).toBeGreaterThan(0);
      expect(successCount).toBeLessThanOrEqual(100);
    }, 15000);
  });

  describe('Tests de Charge - Stress Test', () => {
    test('devrait gérer un stress test avec différents endpoints', async () => {
      const requests = [];
      
      // Mélanger différents types de requêtes
      for (let i = 0; i < 150; i++) {
        if (i % 3 === 0) {
          // Requêtes GET
          requests.push(request(app).get('/api/test'));
        } else if (i % 3 === 1) {
          // Requêtes authentifiées
          requests.push(
            request(app)
              .get('/api/users')
              .set('Authorization', `Bearer ${authToken}`)
          );
        } else {
          // Requêtes POST (création)
          requests.push(
            request(app)
              .post('/api/users')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                firstName: `Stress${i}`,
                lastName: `Test${i}`,
                email: `stress${i}@example.com`,
                password: 'Password123!'
              })
          );
        }
      }

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const successCount = responses.filter(res => [200, 201].includes(res.status)).length;
      const failureCount = responses.filter(res => ![200, 201, 429].includes(res.status)).length;
      const rateLimitedCount = responses.filter(res => res.status === 429).length;

      console.log(`\n📊 Test de charge - Stress Test Mixte:`);
      console.log(`   Requêtes totales: ${responses.length}`);
      console.log(`   Succès: ${successCount}`);
      console.log(`   Échecs: ${failureCount}`);
      console.log(`   Limitées: ${rateLimitedCount}`);
      console.log(`   Durée: ${duration}ms`);
      console.log(`   Taux de succès: ${((successCount / responses.length) * 100).toFixed(2)}%`);

      expect(successCount).toBeGreaterThan(responses.length * 0.85); // 85% de succès minimum
      expect(duration).toBeLessThan(30000); // Moins de 30 secondes
    }, 35000);
  });

  describe('Tests de Performance - Mémoire et CPU', () => {
    test('devrait maintenir des temps de réponse cohérents', async () => {
      const responseTimes = [];
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        const startTime = process.hrtime.bigint();
        await request(app).get('/api/test');
        const endTime = process.hrtime.bigint();
        
        const responseTime = Number(endTime - startTime) / 1000000; // Convertir en ms
        responseTimes.push(responseTime);
      }

      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      console.log(`\n📊 Performance - Temps de réponse:`);
      console.log(`   Moyenne: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Minimum: ${minResponseTime.toFixed(2)}ms`);
      console.log(`   Maximum: ${maxResponseTime.toFixed(2)}ms`);

      expect(avgResponseTime).toBeLessThan(100); // Moins de 100ms en moyenne
      expect(maxResponseTime).toBeLessThan(500); // Moins de 500ms maximum
    }, 10000);

    test('devrait gérer les requêtes séquentielles efficacement', async () => {
      const sequentialRequests = 50;
      const responseTimes = [];

      for (let i = 0; i < sequentialRequests; i++) {
        const startTime = Date.now();
        await request(app).get('/api/test');
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
      }

      const totalTime = responseTimes.reduce((sum, time) => sum + time, 0);
      const avgTime = totalTime / responseTimes.length;

      console.log(`\n📊 Performance - Requêtes séquentielles:`);
      console.log(`   Requêtes: ${sequentialRequests}`);
      console.log(`   Temps total: ${totalTime}ms`);
      console.log(`   Moyenne: ${avgTime.toFixed(2)}ms`);

      expect(avgTime).toBeLessThan(50); // Moins de 50ms en moyenne
      expect(totalTime).toBeLessThan(5000); // Moins de 5 secondes au total
    }, 10000);
  });
});

describe('Tests de Charge - Base de Données', () => {
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

  test('devrait gérer 30 créations et suppressions simultanées', async () => {
    const concurrentRequests = 30;
    let createdUserIds = [];

    // Création
    const createPromises = Array(concurrentRequests).fill().map((_, index) =>
      request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: `DB${index}`,
          lastName: `Test${index}`,
          email: `dbtest${index}@example.com`,
          password: 'Password123!'
        })
    );

    const createStartTime = Date.now();
    const createResponses = await Promise.all(createPromises);
    const createEndTime = Date.now();
    const createDuration = createEndTime - createStartTime;

    // Récupérer les IDs des utilisateurs créés
    createdUserIds = createResponses
      .filter(res => res.status === 201)
      .map(res => res.body.user.id);

    // Suppression
    const deletePromises = createdUserIds.map(id =>
      request(app)
        .delete(`/api/users/${id}`)
        .set('Authorization', `Bearer ${authToken}`)
    );

    const deleteStartTime = Date.now();
    const deleteResponses = await Promise.all(deletePromises);
    const deleteEndTime = Date.now();
    const deleteDuration = deleteEndTime - deleteStartTime;

    const createSuccessCount = createResponses.filter(res => res.status === 201).length;
    const deleteSuccessCount = deleteResponses.filter(res => res.status === 200).length;

    console.log(`\n📊 Test de charge - Base de données (CRUD):`);
    console.log(`   Création: ${createSuccessCount}/${concurrentRequests} en ${createDuration}ms`);
    console.log(`   Suppression: ${deleteSuccessCount}/${createdUserIds.length} en ${deleteDuration}ms`);
    console.log(`   Total: ${(createDuration + deleteDuration)}ms`);

    expect(createSuccessCount).toBeGreaterThan(concurrentRequests * 0.90);
    expect(deleteSuccessCount).toBeGreaterThan(createdUserIds.length * 0.90);
    expect(createDuration + deleteDuration).toBeLessThan(20000); // Moins de 20 secondes
  }, 30000);
});

describe('Tests de Charge - Authentification JWT', () => {
  let tokens = [];

  beforeAll(async () => {
    // Créer plusieurs tokens pour les tests
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@nodejs-project.com',
          password: 'admin123'
        });
      
      if (response.status === 200) {
        tokens.push(response.body.token);
      }
    }
  });

  test('devrait gérer 100 requêtes authentifiées simultanées', async () => {
    const concurrentRequests = 100;
    const promises = Array(concurrentRequests).fill().map((_, index) => {
      const token = tokens[index % tokens.length];
      return request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);
    });

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = responses.filter(res => res.status === 200).length;

    console.log(`\n📊 Test de charge - Authentification JWT:`);
    console.log(`   Requêtes: ${concurrentRequests}`);
    console.log(`   Succès: ${successCount}`);
    console.log(`   Durée: ${duration}ms`);
    console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

    expect(successCount).toBeGreaterThan(concurrentRequests * 0.95);
    expect(duration).toBeLessThan(10000); // Moins de 10 secondes
  }, 15000);

  test('devrait gérer 50 rafraîchissements de tokens simultanés', async () => {
    const concurrentRequests = 50;
    const promises = Array(concurrentRequests).fill().map((_, index) => {
      const token = tokens[index % tokens.length];
      return request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`);
    });

    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const successCount = responses.filter(res => res.status === 200).length;

    console.log(`\n📊 Test de charge - Refresh Tokens:`);
    console.log(`   Requêtes: ${concurrentRequests}`);
    console.log(`   Succès: ${successCount}`);
    console.log(`   Durée: ${duration}ms`);
    console.log(`   Moyenne: ${(duration / concurrentRequests).toFixed(2)}ms par requête`);

    expect(successCount).toBeGreaterThan(concurrentRequests * 0.90);
    expect(duration).toBeLessThan(8000); // Moins de 8 secondes
  }, 12000);
});

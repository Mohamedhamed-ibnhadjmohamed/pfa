# Guide des Tests - NodeJS Project API

Ce guide explique comment utiliser et exécuter les différents types de tests disponibles dans le projet.

## 📋 Table des Matières

- [Types de Tests](#types-de-tests)
- [Configuration](#configuration)
- [Exécution des Tests](#exécution-des-tests)
- [Rapports de Tests](#rapports-de-tests)
- [Dépannage](#dépannage)
- [Bonnes Pratiques](#bonnes-pratiques)

## 🧪 Types de Tests

### 1. Tests Unitaires (`tests/unit.test.js`)

Testent les composants individuels de manière isolée.

**Ce qui est testé :**
- ✅ Constructeur du modèle User
- ✅ Hashage et vérification des mots de passe
- ✅ Validation des données
- ✅ Gestion des rôles
- ✅ Méthodes utilitaires
- ✅ Cas limites et edge cases

**Exécution :**
```bash
npm run test:unit
```

### 2. Tests d'Intégration (`tests/integration.test.js`)

Testent l'interaction entre les différents composants.

**Ce qui est testé :**
- ✅ Authentification complète (login, register, refresh, logout)
- ✅ CRUD des utilisateurs avec authentification
- ✅ Fonctionnalités d'administration
- ✅ Sécurité et permissions
- ✅ Endpoints utilitaires

**Exécution :**
```bash
npm run test:integration
```

### 3. Tests de Charge (`tests/load.test.js`)

Testent les performances sous charge.

**Ce qui est testé :**
- ✅ Requêtes simultanées (100+ connexions)
- ✅ Performance des endpoints
- ✅ Rate limiting
- ✅ Stress test mixte
- ✅ Performance de la base de données
- ✅ Authentification JWT sous charge

**Exécution :**
```bash
npm run test:load
```

## ⚙️ Configuration

### Variables d'Environnement

Les tests utilisent des variables d'environnement spécifiques :

```env
NODE_ENV=test
DB_NAME=nodejs_project_test
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=1h
```

### Configuration Jest

La configuration se trouve dans `tests/jest.config.js` :

- **Timeout** : 30 secondes
- **Workers** : 50% des CPU disponibles (2 en CI)
- **Coverage** : 80% minimum global
- **Reports** : JUnit, HTML, LCOV

### Base de Données de Test

Les tests utilisent une base de données séparée pour ne pas affecter les données de développement :

```bash
# Créer la base de données de test
mysql -u root -p -e "CREATE DATABASE nodejs_project_test;"

# Utiliser le schéma existant
mysql -u root -p nodejs_project_test < database/schema.sql
```

## 🚀 Exécution des Tests

### Scripts Disponibles

| Commande | Description | Durée approximative |
|----------|-------------|-------------------|
| `npm test` | Tous les tests avec coverage | 2-3 minutes |
| `npm run test:unit` | Tests unitaires seulement | 30-45 secondes |
| `npm run test:integration` | Tests d'intégration | 1-2 minutes |
| `npm run test:load` | Tests de charge | 3-5 minutes |
| `npm run test:quick` | Tests unitaires rapides | 15-30 secondes |
| `npm run test:full` | Tests complets avec coverage | 3-4 minutes |
| `npm run test:watch` | Mode surveillance | Continue |
| `npm run test:ci` | Tests pour CI/CD | 2-3 minutes |

### Exemples d'Utilisation

#### Développement Rapide
```bash
# Tests unitaires rapides pendant le développement
npm run test:quick
```

#### Avant Commit
```bash
# Tests complets avec coverage
npm run test:full
```

#### Tests de Performance
```bash
# Tests de charge pour vérifier la performance
npm run test:load
```

#### Surveillance Continue
```bash
# Relancer automatiquement les tests lors des modifications
npm run test:watch
```

## 📊 Rapports de Tests

### Coverage Report

Après l'exécution des tests avec coverage, plusieurs rapports sont générés :

- **Console** : Résumé textuel
- **HTML** : `coverage/lcov-report/index.html`
- **LCOV** : `coverage/lcov.info`
- **JSON** : `coverage/coverage-final.json`

### JUnit Report

Pour l'intégration CI/CD :

- **Fichier** : `test-results/junit.xml`
- **Format** : XML standard JUnit

### Performance Report

Les tests de charge génèrent des métriques détaillées dans la console :

```
📊 Test de charge - Connexions simultanées:
   Requêtes: 100
   Succès: 98
   Échecs: 2
   Durée: 2341ms
   Moyenne: 23.41ms par requête
```

## 🛠️ Dépannage

### Problèmes Courants

#### 1. Connexion Base de Données

**Erreur** : `ECONNREFUSED 127.0.0.1:3306`

**Solution** :
```bash
# Vérifier que MySQL est démarré
mysql --version

# Démarrer MySQL si nécessaire
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS

# Vérifier la base de données de test
mysql -u root -p -e "SHOW DATABASES LIKE 'nodejs_project%';"
```

#### 2. Tests Timeout

**Erreur** : `Timeout - Async callback was not invoked within the 30000ms timeout`

**Solution** :
```bash
# Augmenter le timeout dans jest.config.js
testTimeout: 60000  // 60 secondes
```

#### 3. Port Déjà Utilisé

**Erreur** : `EADDRINUSE :::3000`

**Solution** :
```bash
# Trouver et tuer le processus utilisant le port
lsof -ti:3000 | xargs kill -9  # Linux/macOS
netstat -ano | findstr :3000  # Windows
```

#### 4. Dépendances Manquantes

**Erreur** : `Cannot find module 'jest'`

**Solution** :
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Nettoyage des Tests

```bash
# Nettoyer les données de test
npm run test:clean

# Réinitialiser complètement
npm run test:clean
npm run test:setup
```

### Mode Verbose

Pour plus de détails lors de l'exécution :

```bash
# Mode verbose pour tous les tests
npm test -- --verbose

# Mode verbose pour un type de test spécifique
npm run test:unit -- --verbose
```

## 🎯 Bonnes Pratiques

### 1. Isolation des Tests

Chaque test doit être indépendant :

```javascript
// ✅ Bon : Créer des données spécifiques pour chaque test
test('devrait créer un utilisateur', async () => {
  const userData = generateUniqueUserData();
  const user = await User.create(userData);
  // ... assertions
});

// ❌ Mauvais : Dépendre d'états précédents
test('devrait mettre à jour l\'utilisateur créé précédemment', async () => {
  // Dépend d'un test précédent
});
```

### 2. Nettoyage Automatique

Utiliser les hooks de Jest pour le nettoyage :

```javascript
afterEach(async () => {
  // Nettoyer les données créées pendant le test
  await cleanupTestData();
});
```

### 3. Tests Déterministes

Éviter les valeurs aléatoires dans les assertions :

```javascript
// ✅ Bon : Valeurs prévisibles
test('devrait formater la date correctement', () => {
  const date = new Date('2024-01-01T00:00:00.000Z');
  const formatted = formatDate(date);
  expect(formatted).toBe('2024-01-01');
});

// ❌ Mauvais : Valeurs aléatoires
test('devrait générer une date', () => {
  const date = new Date();
  expect(date).toBe(new Date()); // Toujours faux
});
```

### 4. Tests de Performance

Mesurer les performances de manière cohérente :

```javascript
test('devrait répondre rapidement', async () => {
  const { duration } = await measureTime(() => apiCall());
  expect(duration).toBeLessThan(100); // Moins de 100ms
});
```

### 5. Gestion des Erreurs

Tester les cas d'erreur explicitement :

```javascript
test('devrait gérer les données invalides', async () => {
  const response = await request(app)
    .post('/api/users')
    .send(invalidData);
  
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('errors');
});
```

## 📈 Métriques de Qualité

### Objectifs de Coverage

- **Global** : 80%
- **Contrôleurs** : 85%
- **Modèles** : 90%

### Objectifs de Performance

- **Requêtes GET** : < 50ms (95th percentile)
- **Requêtes POST** : < 100ms (95th percentile)
- **Charge simultanée** : 100+ requêtes sans dégradation

### Objectifs de Fiabilité

- **Succès rate** : > 95%
- **Timeout rate** : < 1%
- **Error rate** : < 0.1%

## 🔧 Outils Recommandés

### VS Code Extensions

- **Jest** : Exécution de tests directement dans l'éditeur
- **Coverage Gutters** : Visualisation du coverage
- **Test Explorer UI** : Interface graphique pour les tests

### Monitoring

- **Jest HTML Reporter** : Rapports HTML détaillés
- **Jest JUnit** : Intégration CI/CD
- **Artillery** : Tests de charge avancés

---

**Pour plus d'informations, consultez la documentation Jest officielle : https://jestjs.io/docs/getting-started**

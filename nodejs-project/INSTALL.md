# Guide d'Installation - NodeJS Project API

Ce guide vous aidera à installer et configurer l'API NodeJS Project étape par étape.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés :

### Logiciels requis
- **Node.js** version 18.0 ou supérieure
- **MySQL** version 8.0 ou supérieure
- **npm** (généralement inclus avec Node.js) ou **yarn**
- **Git** (pour cloner le repository)

### Vérification des prérequis
```bash
# Vérifier Node.js
node --version
# Doit afficher quelque chose comme: v18.17.0

# Vérifier npm
npm --version
# Doit afficher quelque chose comme: 9.6.7

# Vérifier MySQL
mysql --version
# Doit afficher la version de MySQL installée
```

## 🚀 Étapes d'Installation

### 1. Cloner le Repository

```bash
# Option 1: HTTPS
git clone https://github.com/votre-username/nodejs-project.git

# Option 2: SSH (si vous avez configuré les clés SSH)
git clone git@github.com:votre-username/nodejs-project.git

# Entrer dans le répertoire du projet
cd nodejs-project
```

### 2. Installation des Dépendances

```bash
# Avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Configuration de la Base de Données

#### 3.1 Créer la Base de Données

Connectez-vous à MySQL en tant que root :

```bash
# Se connecter à MySQL
mysql -u root -p

# Une fois connecté, créer la base de données
CREATE DATABASE nodejs_project CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Vérifier que la base de données a été créée
SHOW DATABASES;

# Quitter MySQL
EXIT;
```

#### 3.2 Exécuter le Schéma

```bash
# Exécuter le script SQL pour créer les tables
mysql -u root -p nodejs_project < database/schema.sql

# Ou si vous avez un mot de passe spécifique
mysql -u root -p[votre_mot_de_passe] nodejs_project < database/schema.sql
```

#### 3.3 Vérifier l'Installation

```bash
# Se connecter à la base de données
mysql -u root -p nodejs_project

# Vérifier les tables
SHOW TABLES;

# Vérifier la structure de la table users
DESCRIBE users;

# Vérifier l'utilisateur admin par défaut
SELECT * FROM users WHERE email = 'admin@nodejs-project.com';

# Quitter MySQL
EXIT;
```

### 4. Configuration des Variables d'Environnement

#### 4.1 Créer le Fichier .env

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

#### 4.2 Configurer le Fichier .env

Ouvrez le fichier `.env` avec votre éditeur de texte préféré :

```bash
# Avec nano
nano .env

# Ou avec vim
vim .env

# Ou avec VS Code
code .env
```

Modifiez les valeurs selon votre configuration :

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=nodejs_project

# Serveur
PORT=3000
NODE_ENV=development

# JWT (très important!)
JWT_SECRET=votre_secret_key_tres_long_et_aleatoire_de_32_caracteres_minimum
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:4200
```

#### 4.3 Générer un JWT Secret Sécurisé

```bash
# Générer un secret sécurisé (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou utiliser openssl
openssl rand -base64 32
```

### 5. Test de l'Installation

#### 5.1 Démarrer le Serveur

```bash
# Mode développement (avec redémarrage automatique)
npm run dev

# Ou mode production
npm start
```

#### 5.2 Vérifier que le Serveur Fonctionne

Ouvrez votre navigateur et accédez à :
- **API principale**: http://localhost:3000
- **Documentation Swagger**: http://localhost:3000/api-docs
- **Test endpoint**: http://localhost:3000/api/test

#### 5.3 Tester l'Authentification

```bash
# Test de connexion avec l'admin par défaut
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nodejs-project.com",
    "password": "admin123"
  }'
```

### 6. Installation des Dépendances Swagger

```bash
# Installer les dépendances Swagger
npm install swagger-jsdoc swagger-ui-express
```

## 🔧 Configuration Avancée

### Configuration MySQL Optimisée

Pour une meilleure performance, ajoutez ces lignes à votre configuration MySQL (`my.cnf` ou `my.ini`) :

```ini
[mysqld]
# Configuration pour NodeJS Project
innodb_buffer_pool_size = 256M
max_connections = 100
query_cache_size = 16M
```

### Configuration Production

Pour la production, modifiez votre `.env` :

```env
NODE_ENV=production
PORT=3000
DB_HOST=votre_host_mysql_production
JWT_SECRET=votre_secret_production_tres_securise
FRONTEND_URL=https://votre-domaine-frontend.com
```

### Configuration HTTPS (Production)

```bash
# Installer les dépendances SSL
npm install https fs

# Créer un dossier pour les certificats
mkdir certificates
```

## 🧪 Tests et Validation

### Tests de Base

```bash
# Tester tous les endpoints
npm test

# Tests unitaires
npm run test:unit
```

### Validation Manuel

1. **Test de création d'utilisateur** :
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

2. **Test de récupération du profil** (après avoir obtenu un token) :
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN"
```

## 🚨 Dépannage

### Problèmes Courants

#### 1. Erreur de Connexion MySQL
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution** :
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `.env`
- Vérifiez que la base de données existe

#### 2. Erreur JWT
```
JsonWebTokenError: invalid signature
```

**Solution** :
- Vérifiez que `JWT_SECRET` est défini dans `.env`
- Générez un nouveau secret sécurisé

#### 3. Erreur de Port
```
Error: listen EADDRINUSE :::3000
```

**Solution** :
- Changez le port dans `.env`
- Ou arrêtez le processus utilisant le port 3000

#### 4. Erreur de Dépendances
```
Error: Cannot find module 'express'
```

**Solution** :
```bash
npm install
# Ou
rm -rf node_modules package-lock.json
npm install
```

### Logs et Debug

```bash
# Voir les logs du serveur
npm run dev

# Logs MySQL
tail -f /var/log/mysql/error.log  # Linux/macOS
# Ou vérifier les logs dans MySQL Workbench
```

## 📚 Ressources Utiles

- [Documentation Node.js](https://nodejs.org/docs/)
- [Documentation Express.js](https://expressjs.com/)
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Documentation JWT](https://jwt.io/)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs d'erreur
2. Consultez la section Dépannage ci-dessus
3. Ouvrez une issue sur GitHub
4. Contactez le support : support@nodejs-project.com

---

**Installation terminée ! 🎉**

Votre API NodeJS Project est maintenant prête à être utilisée. Accédez à http://localhost:3000/api-docs pour voir la documentation complète.

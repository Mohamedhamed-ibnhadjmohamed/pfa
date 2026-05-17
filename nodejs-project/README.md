# NodeJS Project API

Backend API pour le projet PFE avec gestion complète des utilisateurs, authentification JWT et système de rôles.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de données](#base-de-données)
- [API Documentation](#api-documentation)
- [Endpoints](#endpoints)
- [Sécurité](#sécurité)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Contributions](#contributions)

## 🚀 Fonctionnalités

- ✅ **Authentification JWT** avec refresh tokens
- ✅ **Gestion des utilisateurs** (CRUD complet)
- ✅ **Système de rôles** (admin/user)
- ✅ **Validation des données** avec express-validator
- ✅ **Sécurité** avec helmet, rate limiting, CORS
- ✅ **Hashage des mots de passe** avec bcrypt
- ✅ **Sauvegarde mots de passe** (crypté + non-crypté)
- ✅ **Middleware d'authentification**
- ✅ **Gestion des erreurs**
- ✅ **Documentation Swagger/OpenAPI**

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hashage des mots de passe
- **express-validator** - Validation des données
- **helmet** - Sécurité HTTP
- **cors** - Gestion CORS
- **swagger-ui-express** - Documentation API

## 📦 Installation

### Prérequis

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/nodejs-project.git
cd nodejs-project
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE nodejs_project;
```

4. **Exécuter le schéma**
```bash
mysql -u root -p nodejs_project < database/schema.sql
```

5. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

6. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=nodejs_project

# Serveur
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=votre_secret_key_tres_securise
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:4200
```

### Configuration recommandée

- **JWT_SECRET**: Utilisez une chaîne de 32+ caractères aléatoires
- **NODE_ENV**: `production` en environnement de production
- **FRONTEND_URL**: URL de votre application frontend

## 🗄️ Base de données

### Structure de la table `users`

| Champ | Type | Description |
|-------|------|-------------|
| id | INT AUTO_INCREMENT | ID unique |
| firstName | VARCHAR(100) | Prénom |
| lastName | VARCHAR(100) | Nom |
| email | VARCHAR(255) UNIQUE | Email |
| password | VARCHAR(255) | Mot de passe hashé |
| oldmotp | VARCHAR(255) NULL | Mot de passe non crypté |
| phone | VARCHAR(20) NULL | Téléphone |
| role | VARCHAR(50) | Rôle (user/admin) |
| createdAt | TIMESTAMP | Date de création |
| updatedAt | TIMESTAMP | Date de mise à jour |

### Utilisateur admin par défaut

- **Email**: `admin@nodejs-project.com`
- **Mot de passe**: `admin123`
- **Rôle**: `admin`

## 📚 API Documentation

### Swagger UI

Une fois le serveur démarré, accédez à:
- **Documentation interactive**: http://localhost:3000/api-docs
- **JSON OpenAPI**: http://localhost:3000/api-docs.json

## 🔌 Endpoints

### Authentification

#### POST `/api/auth/login`
Connexion d'un utilisateur

```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "phone": "+33612345678"
}
```

#### POST `/api/auth/refresh`
Rafraîchir le token JWT

#### POST `/api/auth/logout`
Déconnexion

### Utilisateurs (protégées)

#### GET `/api/users`
Lister tous les utilisateurs

#### GET `/api/users/:id`
Récupérer un utilisateur par ID

#### POST `/api/users`
Créer un nouvel utilisateur

#### PUT `/api/users/:id`
Mettre à jour un utilisateur

#### DELETE `/api/users/:id`
Supprimer un utilisateur

#### GET `/api/profile`
Récupérer le profil de l'utilisateur connecté

#### PUT `/api/profile`
Mettre à jour le profil

#### POST `/api/change-password`
Changer le mot de passe

### Administration (admin uniquement)

#### GET `/api/admin/users`
Lister tous les utilisateurs avec leurs rôles

#### PUT `/api/admin/users/:id/role`
Mettre à jour le rôle d'un utilisateur

#### GET `/api/admin/stats`
Statistiques des utilisateurs

#### GET `/api/admin/roles`
Liste des rôles disponibles

#### GET `/api/admin/user-role`
Informations sur le rôle de l'utilisateur connecté

### Utilitaires

#### GET `/api/test`
Test de l'API

#### GET `/`
Informations sur l'API

## 🔐 Sécurité

### Mesures de sécurité implémentées

- ✅ **Hashage bcrypt** (12 rounds) pour les mots de passe
- ✅ **JWT tokens** avec expiration
- ✅ **Rate limiting** (100 requêtes/15min)
- ✅ **Helmet** pour les en-têtes de sécurité
- ✅ **CORS** configuré
- ✅ **Validation stricte** des entrées
- ✅ **Exclusion des mots de passe** des réponses API

### Bonnes pratiques

1. **Utilisez HTTPS** en production
2. **Changez le JWT_SECRET** régulièrement
3. **Limitez les tentatives de connexion**
4. **Surveillez les logs** d'activité
5. **Maintenez les dépendances** à jour

## 🧪 Tests

### Exécuter les tests

```bash
# Tests complets
npm test

# Tests unitaires
npm run test:unit
```

### Structure des tests

- `test.js` - Tests d'intégration
- `tests/` - Tests unitaires (à venir)

## 🚀 Déploiement

### Production

1. **Variables d'environnement**
```env
NODE_ENV=production
PORT=3000
DB_HOST=votre_host_mysql
```

2. **Build et démarrage**
```bash
npm install --production
npm start
```

### Docker (optionnel)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributions

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Pusher la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📝 License

Ce projet est sous license MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

## 📞 Support

Pour toute question ou support:
- Email: support@nodejs-project.com
- Issues: [GitHub Issues](https://github.com/votre-username/nodejs-project/issues)

---

**Développé avec ❤️ pour le projet PFE**

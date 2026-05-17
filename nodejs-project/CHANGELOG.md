# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2024-02-09

### Ajouté
- 🚀 **API REST complète** avec Express.js
- 🔐 **Authentification JWT** avec refresh tokens
- 👥 **Gestion des utilisateurs** (CRUD complet)
- 🛡️ **Système de rôles** (admin/user)
- 📊 **Panel d'administration**
- 🔒 **Sécurité renforcée** avec helmet, rate limiting, CORS
- 📝 **Validation des données** avec express-validator
- 🔐 **Hashage des mots de passe** avec bcrypt (12 rounds)
- 💾 **Double sauvegarde des mots de passe** (crypté + non-crypté)
- 📚 **Documentation Swagger/OpenAPI** complète
- 📖 **README détaillé** avec guide d'utilisation
- 🔧 **Guide d'installation** complet
- 🧪 **Tests d'intégration**
- 🗄️ **Base de données MySQL** avec schéma optimisé

### Fonctionnalités de Sécurité
- Middleware d'authentification JWT
- Rate limiting (100 requêtes/15min)
- Helmet pour les en-têtes de sécurité
- CORS configuré
- Validation stricte des entrées
- Exclusion des mots de passe des réponses API

### Endpoints API

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription  
- `POST /api/auth/refresh` - Rafraîchir token
- `POST /api/auth/logout` - Déconnexion

#### Utilisateurs (protégés)
- `GET /api/users` - Lister tous les utilisateurs
- `GET /api/users/:id` - Récupérer un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur
- `GET /api/profile` - Profil utilisateur
- `PUT /api/profile` - Mettre à jour profil
- `POST /api/change-password` - Changer mot de passe

#### Administration (admin uniquement)
- `GET /api/admin/users` - Liste utilisateurs avec rôles
- `PUT /api/admin/users/:id/role` - Mettre à jour rôle
- `GET /api/admin/stats` - Statistiques utilisateurs
- `GET /api/admin/roles` - Rôles disponibles
- `GET /api/admin/user-role` - Rôle utilisateur courant

#### Documentation
- `GET /api-docs` - Interface Swagger UI
- `GET /api-docs.json` - Spécification OpenAPI

#### Utilitaires
- `GET /api/test` - Test de l'API
- `GET /` - Informations sur l'API

### Base de Données
- Table `users` avec champs complets
- Champ `oldmotp` pour sauvegarde mot de passe non crypté
- Index sur email pour performances
- Utilisateur admin par défaut (admin@nodejs-project.com / admin123)

### Configuration
- Support des variables d'environnement (.env)
- Configuration développement/production
- JWT configurable
- Base de données configurable
- CORS configurable

### Documentation
- README.md complet avec exemples
- INSTALL.md avec guide étape par étape
- Documentation Swagger interactive
- Spécification OpenAPI 3.0
- Exemples de requêtes curl

### Tests
- Tests d'intégration automatisés
- Validation des fonctionnalités de base
- Tests de connexion à la base de données
- Tests de rôles et permissions

## [Future] - Prochaines Versions

### Prévu (v1.1.0)
- 📧 Service d'envoi d'emails
- 🔄 Système de notifications
- 📊 Analytics et monitoring
- 🗂️ Gestion de fichiers/uploads

### Envisagé (v1.2.0)
- 🔐 2FA (Double authentification)
- 📱 Support mobile
- 🐳 Conteneurisation Docker
- ☁️ Déploiement cloud

### Long terme (v2.0.0)
- 🔄 Architecture microservices
- 🤖 Intelligence artificielle
- 📊 Tableau de bord avancé
- 🔌 Plugins et extensions

---

## Notes de Version

### v1.0.0 Notes
- Version initiale complète
- Toutes les fonctionnalités de base implémentées
- Documentation complète
- Tests fonctionnels
- Prêt pour production

### Convention de Versionnement
- **MAJOR** : Changements qui ne sont pas rétrocompatibles
- **MINOR** : Nouvelles fonctionnalités rétrocompatibles  
- **PATCH** : Corrections de bugs rétrocompatibles

---

**Développé avec ❤️ pour le projet PFE**

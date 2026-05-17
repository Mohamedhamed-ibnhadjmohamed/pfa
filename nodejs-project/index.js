require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const UserController = require('./controllers/userController');
const AuthController = require('./controllers/authController');
const AdminController = require('./controllers/adminController');
const { specs, swaggerUi } = require('./config/swagger');

const app = express();
const port = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Limiter les requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limiter chaque IP à 100 requêtes par windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Node.js API with MySQL is running!',
    version: '1.0.0',
    documentation: {
      swagger: '/api-docs',
      openapi: '/api-docs.json'
    },
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      admin: '/api/admin',
      test: '/api/test'
    }
  });
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API fonctionne correctement!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NodeJS Project API Documentation'
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Routes d'authentification
app.post('/api/auth/login', AuthController.validateLogin, AuthController.login);
app.post('/api/auth/register', AuthController.validateRegister, AuthController.register);
app.post('/api/auth/refresh', AuthController.refreshToken);
app.post('/api/auth/logout', AuthController.logout);

// Routes des utilisateurs (protégées)
app.get('/api/users', AuthController.authenticateToken, UserController.getAllUsers);
app.get('/api/users/:id', AuthController.authenticateToken, UserController.getUserById);
app.post('/api/users', AuthController.authenticateToken, UserController.validateCreate, UserController.createUser);
app.put('/api/users/:id', AuthController.authenticateToken, UserController.validateUpdate, UserController.updateUser);
app.delete('/api/users/:id', AuthController.authenticateToken, UserController.deleteUser);
app.get('/api/users/search', AuthController.authenticateToken, UserController.searchUsers);

// Routes profil (protégées)
app.get('/api/profile', AuthController.authenticateToken, UserController.getProfile);
app.put('/api/profile', AuthController.authenticateToken, UserController.updateProfile);
app.post('/api/change-password', AuthController.authenticateToken, UserController.changePassword);

// Routes admin (protégées)
app.get('/api/admin/users', AuthController.authenticateToken, AdminController.requireAdmin, AdminController.getAllUsersWithRoles);
app.put('/api/admin/users/:id/role', AuthController.authenticateToken, AdminController.requireAdmin, AdminController.validateRoleUpdate, AdminController.updateUserRole);
app.get('/api/admin/stats', AuthController.authenticateToken, AdminController.requireAdmin, AdminController.getUserStats);
app.get('/api/admin/roles', AuthController.authenticateToken, AdminController.requireAdmin, AdminController.getRoles);
app.get('/api/admin/user-role', AuthController.authenticateToken, AdminController.requireAdmin, AdminController.getCurrentUserRole);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log(`📡 API disponible sur http://localhost:${port}`);
  console.log(`📚 Documentation Swagger: http://localhost:${port}/api-docs`);
  console.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
  console.log(`📖 Documentation complète: http://localhost:${port}/`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

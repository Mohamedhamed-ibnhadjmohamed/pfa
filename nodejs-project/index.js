require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userController = require('./controllers/userController');
const authController = require('./controllers/authController');

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
  res.json({ message: 'Node.js API with MySQL is running!' });
});

// Routes d'authentification
app.post('/api/auth/login', authController.validateLogin, authController.login);
app.post('/api/auth/register', authController.validateRegister, authController.register);
app.post('/api/auth/refresh', authController.refreshToken);
app.post('/api/auth/logout', authController.logout);

// Routes des utilisateurs (protégées)
app.get('/api/users', userController.getAllUsers);
app.get('/api/users/:id', userController.getUserById);
app.post('/api/users', authController.validateRegister, userController.createUser);
app.put('/api/users/:id', userController.updateUser);
app.delete('/api/users/:id', userController.deleteUser);
app.post('/api/users/:id/connections', userController.addConnection);

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

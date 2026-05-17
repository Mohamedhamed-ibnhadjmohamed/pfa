const { validationResult } = require('express-validator');
const User = require('../models/User');
const AuthUtils = require('../utils/authUtils');
const AuthMiddleware = require('../middleware/authMiddleware');

class AuthController {
  static validateLogin = [
    require('express-validator').body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    require('express-validator').body('password').isLength({ min: 1 }).withMessage('Le mot de passe est requis')
  ];

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return AuthUtils.handleValidationError(res, errors);

      const { email, password } = req.body;
      const user = await User.findByEmail(email);

      if (!user?.checkPassword(password)) return AuthUtils.handleAuthError(res);

      const { token, refreshToken } = AuthUtils.generateTokens({ userId: user.id, email: user.email });

      res.json({
        message: 'Connexion réussie',
        user: user.toJSON(),
        token,
        refreshToken
      });
    } catch (error) {
      AuthUtils.handleServerError(res, error);
    }
  }


  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return AuthUtils.handleValidationError(res, errors);

      const { firstName, lastName, email, password, phone } = req.body;

      try {
        const newUser = await User.create({ firstName, lastName, email, password, phone, role: 'user' });
        const { token, refreshToken } = AuthUtils.generateTokens({ userId: newUser.id, email: newUser.email });

        res.status(201).json({
          message: 'Inscription réussie',
          user: newUser.toJSON(),
          token,
          refreshToken
        });
      } catch (error) {
        if (error.message === 'Cet email est déjà utilisé') return AuthUtils.handleDuplicateEmailError(res);
        throw error;
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return AuthUtils.handleDuplicateEmailError(res);
      AuthUtils.handleServerError(res, error);
    }
  }

  static async refreshToken(req, res) {
    try {
      const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
      if (!token) return res.status(401).json({ message: 'Token manquant' });

      const decoded = AuthUtils.verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

      const { token: newToken } = AuthUtils.generateTokens({ userId: user.id, email: user.email });
      res.json({ message: 'Token rafraîchi', token: newToken });
    } catch (error) {
      res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  }

  static async logout(req, res) {
    try {
      res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
      AuthUtils.handleServerError(res, error);
    }
  }

  static authenticateToken = AuthMiddleware.authenticateToken;
  static authenticateUser = AuthMiddleware.authenticateUser;
  static requireAdmin = AuthMiddleware.requireAdmin;
  static requireUser = AuthMiddleware.requireUser;
}

module.exports = AuthController;
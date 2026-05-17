const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthUtils {
  static generateTokens(payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    return { token, refreshToken };
  }

  static verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  static extractTokenFromHeader(authHeader) {
    return authHeader?.replace('Bearer ', '') || null;
  }

  static handleValidationError(res, errors) {
    return res.status(400).json({ 
      message: 'Données invalides', 
      errors: errors.array() 
    });
  }

  static handleAuthError(res, message = 'Email ou mot de passe incorrect') {
    return res.status(401).json({ message });
  }

  static handleServerError(res, error, context = 'Erreur serveur') {
    console.error(`${context}:`, error);
    return res.status(500).json({ message: context });
  }

  static handleDuplicateEmailError(res) {
    return res.status(409).json({ message: 'Cet email est déjà utilisé' });
  }
}

module.exports = AuthUtils;

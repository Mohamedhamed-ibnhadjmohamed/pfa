const AuthUtils = require('../utils/authUtils');
const User = require('../models/User');

class AuthMiddleware {
  static authenticateToken(req, res, next) {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    try {
      const decoded = AuthUtils.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Token invalide' });
    }
  }

  static async authenticateUser(req, res, next) {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    try {
      const decoded = AuthUtils.verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
      
      req.user = decoded;
      req.userProfile = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Token invalide' });
    }
  }

  static requireRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.userProfile) {
        return res.status(401).json({ message: 'Authentification requise' });
      }

      if (!allowedRoles.includes(req.userProfile.role)) {
        return res.status(403).json({ message: 'Autorisation refusée' });
      }

      next();
    };
  }

  static requireAdmin = AuthMiddleware.requireRole('admin');
  static requireUser = AuthMiddleware.requireRole('user', 'admin');
}

module.exports = AuthMiddleware;

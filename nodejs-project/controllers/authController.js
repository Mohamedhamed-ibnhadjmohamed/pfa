const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../database/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthController {
  // Validation middleware
  static validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 1 }).withMessage('Le mot de passe est requis')
  ];

  static validateRegister = [
    body('firstName').trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
      .matches(/^(?=.*[!@#$%^&*(),.?":{}|<>])/)
      .withMessage('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?":{}|<>)'),
    body('phone').optional().isMobilePhone('any').withMessage('Numéro de téléphone invalide'),
    body('location').optional().trim().isLength({ max: 255 }).withMessage('La localisation est trop longue')
    // acceptTerms et newsletter sont gérés uniquement côté frontend
  ];

  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Données invalides', 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Rechercher l'utilisateur (sans dépendre d'une VIEW)
      const users = await db.query(`
        SELECT
          u.*,
          us.two_factor_enabled as twoFactorEnabled,
          us.email_notifications as emailNotifications,
          us.private_session as privateSession,
          us.public_profile as publicProfile,
          us.email_searchable as emailSearchable,
          us.data_sharing as dataSharing,
          us.timezone as timezone,
          us.date_format as dateFormat
        FROM users u
        LEFT JOIN user_settings us ON u.id = us.user_id
        WHERE u.email = ?
        LIMIT 1
      `, [email]);

      if (users.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const user = users[0];

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Ajouter une nouvelle connexion
      await AuthController.addConnection(user.id, {
        device: req.body.device || 'unknown',
        location: req.body.location || 'Unknown',
        ipAddress: req.ip || req.connection.remoteAddress,
        browser: req.get('User-Agent') || 'Unknown',
        status: 'success'
      });

      // Retirer le mot de passe de la réponse
      const { password: _, ...userWithoutPassword } = user;

      // Générer le refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token,
        refreshToken
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Données invalides', 
          errors: errors.array() 
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        bio,
        location,
        website,
        birthDate,
        gender,
        language,
        avatar,
      } = req.body;

      const connection = await db.getConnection();
      
      try {
        await connection.beginTransaction();

        // Vérifier si l'email existe déjà
        const existingUsers = await connection.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );

        if (existingUsers[0].length > 0) {
          await connection.rollback();
          return res.status(409).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insérer le nouvel utilisateur
        const [userResult] = await connection.execute(`
          INSERT INTO users (firstName, lastName, email, password, phone, bio, location, website, birthDate, gender, language, avatar)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          firstName,
          lastName,
          email,
          hashedPassword,
          phone || null,
          bio || null,
          location || null,
          website || null,
          birthDate || null,
          gender || null,
          language || 'Français',
          avatar || null
        ]);

        const userId = userResult.insertId;

        // Insérer les paramètres par défaut
        await connection.execute(`
          INSERT INTO user_settings (user_id, two_factor_enabled, email_notifications, private_session, public_profile, email_searchable, data_sharing, timezone, date_format)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          false, // twoFactorEnabled
          true, // email_notifications (par défaut, newsletter géré côté frontend)
          false, // privateSession
          true, // publicProfile
          false, // emailSearchable
          false, // dataSharing
          'Europe/Paris', // timezone
          'DD/MM/YYYY' // dateFormat
        ]);

        await connection.commit();

        // Récupérer l'utilisateur créé (sans dépendre d'une VIEW)
        const newUser = await db.query(`
          SELECT
            u.*,
            us.two_factor_enabled as twoFactorEnabled,
            us.email_notifications as emailNotifications,
            us.private_session as privateSession,
            us.public_profile as publicProfile,
            us.email_searchable as emailSearchable,
            us.data_sharing as dataSharing,
            us.timezone as timezone,
            us.date_format as dateFormat
          FROM users u
          LEFT JOIN user_settings us ON u.id = us.user_id
          WHERE u.id = ?
          LIMIT 1
        `, [userId]);

        // Générer le token JWT
        const token = jwt.sign(
          { userId: newUser[0].id, email: newUser[0].email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        // Générer le refresh token
        const refreshToken = jwt.sign(
          { userId: newUser[0].id, type: 'refresh' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = newUser[0];

        res.status(201).json({
          message: 'Inscription réussie',
          user: userWithoutPassword,
          token,
          refreshToken
        });

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Register error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ message: 'Cet email est déjà utilisé' });
      } else {
        res.status(500).json({ message: 'Erreur serveur' });
      }
    }
  }

  static async refreshToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Vérifier si l'utilisateur existe toujours
      const users = await db.query('SELECT id, email FROM users WHERE id = ?', [decoded.userId]);
      
      if (users.length === 0) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      // Générer un nouveau token
      const newToken = jwt.sign(
        { userId: users[0].id, email: users[0].email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Token rafraîchi',
        token: newToken
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  }

  static async logout(req, res) {
    try {
      // Dans une implémentation plus avancée, on pourrait ajouter le token à une liste noire
      res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  static async addConnection(userId, connectionData) {
    try {
      await db.query(`
        INSERT INTO user_connections (user_id, device, location, ip_address, browser, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        userId,
        connectionData.device,
        connectionData.location,
        connectionData.ipAddress,
        connectionData.browser,
        connectionData.status
      ]);
    } catch (error) {
      console.error('Error adding connection:', error);
    }
  }
}

module.exports = AuthController;

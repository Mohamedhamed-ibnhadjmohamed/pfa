const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthController {
  // Validation middleware
  static validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
  ];

  static validateRegister = [
    body('firstName').trim().isLength({ min: 2 }).withMessage('Le prénom doit contenir au moins 2 caractères'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('phone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide'),
    body('location').optional().trim().isLength({ max: 255 }).withMessage('La localisation est trop longue')
  ];

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Données invalides', 
          errors: errors.array() 
        });
      }

      const { email, password } = req.body;

      // Rechercher l'utilisateur
      const users = await db.query(`
        SELECT u.*, 
               JSON_OBJECT(
                 'twoFactorEnabled', us.two_factor_enabled,
                 'emailNotifications', us.email_notifications,
                 'privateSession', us.private_session,
                 'publicProfile', us.public_profile,
                 'emailSearchable', us.email_searchable,
                 'dataSharing', us.data_sharing,
                 'timezone', us.timezone,
                 'dateFormat', us.date_format
               ) as settings,
               (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'id', uc.id,
                   'date', uc.connection_date,
                   'device', uc.device,
                   'location', uc.location,
                   'ipAddress', uc.ip_address,
                   'browser', uc.browser,
                   'status', uc.status
                 )
               ) FROM user_connections uc WHERE uc.user_id = u.id) as connections
        FROM users u
        LEFT JOIN user_settings us ON u.id = us.user_id
        WHERE u.email = ?
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
      await this.addConnection(user.id, {
        device: req.body.device || 'unknown',
        location: req.body.location || 'Unknown',
        ipAddress: req.ip || req.connection.remoteAddress,
        browser: req.get('User-Agent') || 'Unknown',
        status: 'success'
      });

      // Retirer le mot de passe de la réponse
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async register(req, res) {
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
        location,
        website,
        birthDate,
        gender,
        language,
        avatar,
        settings
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
          INSERT INTO users (first_name, last_name, email, password, phone, bio, location, website, birth_date, gender, language, avatar)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          firstName,
          lastName,
          email,
          hashedPassword,
          phone || null,
          req.body.bio || null,
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
          settings?.twoFactorEnabled || false,
          settings?.emailNotifications || true,
          settings?.privateSession || false,
          settings?.publicProfile || true,
          settings?.emailSearchable || false,
          settings?.dataSharing || false,
          settings?.timezone || 'Europe/Paris',
          settings?.dateFormat || 'DD/MM/YYYY'
        ]);

        await connection.commit();

        // Récupérer l'utilisateur créé
        const newUser = await db.query(`
          SELECT u.*, 
                 JSON_OBJECT(
                   'twoFactorEnabled', us.two_factor_enabled,
                   'emailNotifications', us.email_notifications,
                   'privateSession', us.private_session,
                   'publicProfile', us.public_profile,
                   'emailSearchable', us.email_searchable,
                   'dataSharing', us.data_sharing,
                   'timezone', us.timezone,
                   'dateFormat', us.date_format
                 ) as settings,
                 (SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'id', uc.id,
                     'date', uc.connection_date,
                     'device', uc.device,
                     'location', uc.location,
                     'ipAddress', uc.ip_address,
                     'browser', uc.browser,
                     'status', uc.status
                   )
                 ) FROM user_connections uc WHERE uc.user_id = u.id) as connections
          FROM users u
          LEFT JOIN user_settings us ON u.id = us.user_id
          WHERE u.id = ?
        `, [userId]);

        // Générer le token JWT
        const token = jwt.sign(
          { userId: newUser[0].id, email: newUser[0].email },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _, ...userWithoutPassword } = newUser[0];

        res.status(201).json({
          message: 'Inscription réussie',
          user: userWithoutPassword,
          token
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

  async refreshToken(req, res) {
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

  async logout(req, res) {
    try {
      // Dans une implémentation plus avancée, on pourrait ajouter le token à une liste noire
      res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  async addConnection(userId, connectionData) {
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

module.exports = new AuthController();

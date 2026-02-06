const db = require('../database/connection');
const bcrypt = require('bcryptjs');

class UserController {
  static async getAllUsers(req, res) {
    try {
      // Récupérer les utilisateurs (sans dépendre d'une VIEW)
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
        ORDER BY u.created_at DESC
      `);
      
      const usersWithoutPassword = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPassword);

    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      // Récupérer l'utilisateur (sans dépendre d'une VIEW)
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
        WHERE u.id = ?
        LIMIT 1
      `, [id]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      const { password, ...userWithoutPassword } = users[0];
      res.json(userWithoutPassword);

    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  static async createUser(req, res) {
    try {
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
        settings
      } = req.body;

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const connection = await db.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [userResult] = await connection.execute(`
          INSERT INTO users (first_name, last_name, email, password, phone, bio, location, website, birth_date, gender, language, avatar)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [firstName, lastName, email, hashedPassword, phone, bio, location, website, birthDate, gender, language, avatar]);
        
        const userId = userResult.insertId;
        
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
        
        const newUser = await this.getUserById({ params: { id: userId } }, { json: res.json.bind(res) });
        
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(409).json({ error: 'Email already exists' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        phone,
        bio,
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
        
        await connection.execute(`
          UPDATE users 
          SET first_name = ?, last_name = ?, phone = ?, bio = ?, location = ?, website = ?, birth_date = ?, gender = ?, language = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [firstName, lastName, phone, bio, location, website, birthDate, gender, language, avatar, id]);
        
        if (settings) {
          await connection.execute(`
            UPDATE user_settings 
            SET two_factor_enabled = ?, email_notifications = ?, private_session = ?, public_profile = ?, 
                email_searchable = ?, data_sharing = ?, timezone = ?, date_format = ?
            WHERE user_id = ?
          `, [
            settings.twoFactorEnabled,
            settings.emailNotifications,
            settings.privateSession,
            settings.publicProfile,
            settings.emailSearchable,
            settings.dataSharing,
            settings.timezone,
            settings.dateFormat,
            id
          ]);
        }
        
        await connection.commit();
        
        await this.getUserById({ params: { id } }, { json: res.json.bind(res) });
        
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async addConnection(req, res) {
    try {
      const { id } = req.params;
      const { device, location, ipAddress, browser, status } = req.body;
      
      const result = await db.query(`
        INSERT INTO user_connections (user_id, device, location, ip_address, browser, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, device, location, ipAddress, browser, status || 'success']);
      
      res.status(201).json({ 
        id: result.insertId,
        message: 'Connection added successfully' 
      });
    } catch (error) {
      console.error('Error adding connection:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UserController;

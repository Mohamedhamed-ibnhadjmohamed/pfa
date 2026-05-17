const bcrypt = require('bcryptjs');
const db = require('../database/connection');

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName?.trim() || '';
    this.lastName = data.lastName?.trim() || '';
    this.email = data.email?.toLowerCase().trim() || '';
    this.password = data.password ? this.hashPassword(data.password) : null;
    this.phone = data.phone || null;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  hashPassword(password) {
    return bcrypt.hashSync(password, 12);
  }

  checkPassword(password) {
    if (!this.password) return false;
    return bcrypt.compareSync(password, this.password);
  }


  update(updates = {}) {
    Object.assign(this, updates);
    this.updatedAt = new Date();
    return this;
  }

  static async findByEmail(email) {
    try {
      const users = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
      return users.length > 0 ? new User(users[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const users = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return users.length > 0 ? new User(users[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const users = await db.query('SELECT * FROM users ORDER BY createdAt DESC');
      return users.map(user => new User(user));
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) throw new Error('Cet email est déjà utilisé');

      const user = new User(userData);
      const result = await db.query(`
        INSERT INTO users (firstName, lastName, email, password, phone, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.firstName, user.lastName, user.email, user.password, user.phone || null, user.role]);

      return await User.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const user = await User.findById(id);
      if (!user) throw new Error('Utilisateur non trouvé');

      const updates = {};
      if (userData.firstName !== undefined) updates.firstName = userData.firstName.trim();
      if (userData.lastName !== undefined) updates.lastName = userData.lastName.trim();
      if (userData.email !== undefined) updates.email = userData.email.toLowerCase().trim();
      if (userData.password !== undefined) updates.password = user.hashPassword(userData.password);
      if (userData.phone !== undefined) updates.phone = userData.phone;
      if (userData.role !== undefined) updates.role = userData.role;

      if (Object.keys(updates).length === 0) return await User.findById(id);

      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await db.query(`UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    const { password, ...safeUser } = this;
    safeUser.createdAt = this.createdAt.toISOString();
    safeUser.updatedAt = this.updatedAt.toISOString();
    return safeUser;
  }
}

module.exports = User;

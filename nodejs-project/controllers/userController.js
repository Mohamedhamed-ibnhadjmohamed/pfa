const User = require('../models/User');
const AuthUtils = require('../utils/authUtils');

class UserController {

  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      const usersWithoutPassword = users.map(user => user.toJSON());
      
      res.json({
        message: 'Utilisateurs récupérés avec succès',
        users: usersWithoutPassword,
        count: usersWithoutPassword.length
      });
    } catch (error) {
      AuthUtils.handleServerError(res, error, 'Erreur récupération utilisateurs');
    }
  }

  static async createUser(req, res) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;

      try {
        const newUser = await User.create({ firstName, lastName, email, password, phone, role: 'user' });
        res.status(201).json({
          message: 'Utilisateur créé avec succès',
          user: newUser.toJSON()
        });
      } catch (error) {
        if (error.message === 'Cet email est déjà utilisé') return AuthUtils.handleDuplicateEmailError(res);
        throw error;
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return AuthUtils.handleDuplicateEmailError(res);
      AuthUtils.handleServerError(res, error, 'Erreur création utilisateur');
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ message: 'ID utilisateur invalide' });

      const { firstName, lastName, email, password, phone } = req.body;

      try {
        const updatedUser = await User.update(parseInt(id), { firstName, lastName, email, password, phone });
        res.json({
          message: 'Utilisateur mis à jour avec succès',
          user: updatedUser.toJSON()
        });
      } catch (error) {
        if (error.message === 'Utilisateur non trouvé') return res.status(404).json({ message: error.message });
        if (error.message === 'Cet email est déjà utilisé') return AuthUtils.handleDuplicateEmailError(res);
        throw error;
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return AuthUtils.handleDuplicateEmailError(res);
      AuthUtils.handleServerError(res, error, 'Erreur mise à jour utilisateur');
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      if (!id || isNaN(id)) return res.status(400).json({ message: 'ID utilisateur invalide' });
      
      const deleted = await User.delete(parseInt(id));
      if (!deleted) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      
      res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
      AuthUtils.handleServerError(res, error, 'Erreur suppression utilisateur');
    }
  }

}

module.exports = UserController;
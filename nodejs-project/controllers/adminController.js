const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AuthController = require('./authController');

class AdminController {
  // Middleware pour vérifier si l'utilisateur est admin
  static requireAdmin(req, res, next) {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Récupérer l'utilisateur avec son rôle
    User.findById(req.user.userId).then(user => {
      if (!user || !user.isAdmin()) {
        return res.status(403).json({ message: 'Accès refusé - Admin requis' });
      }
      req.userWithRole = user;
      next();
    }).catch(error => {
      console.error('Error checking admin role:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    });
  }

  // Validation middleware pour la mise à jour de rôle
  static validateRoleUpdate = [
    body('role').isIn(['admin', 'user']).withMessage('Rôle invalide - doit être admin ou user')
  ];

  // Obtenir tous les utilisateurs avec leurs rôles (admin seulement)
  static async getAllUsersWithRoles(req, res) {
    try {
      const users = await User.findAll();
      
      const usersWithRoles = users.map(user => ({
        ...user.toJSON(),
        isAdmin: user.isAdmin(),
        isUser: user.isUser()
      }));
      
      res.json({
        message: 'Utilisateurs récupérés avec succès',
        users: usersWithRoles,
        count: usersWithRoles.length
      });

    } catch (error) {
      console.error('Error fetching users with roles:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Mettre à jour le rôle d'un utilisateur (admin seulement)
  static async updateUserRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Données invalides', 
          errors: errors.array() 
        });
      }

      const { id } = req.params;
      const { role } = req.body;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID utilisateur invalide' });
      }

      // Empêcher un admin de modifier son propre rôle
      if (parseInt(id) === req.userWithRole.id) {
        return res.status(403).json({ message: 'Vous ne pouvez pas modifier votre propre rôle' });
      }

      try {
        const updatedUser = await User.update(parseInt(id), { role });

        res.json({
          message: 'Rôle utilisateur mis à jour avec succès',
          user: {
            ...updatedUser.toJSON(),
            isAdmin: updatedUser.isAdmin(),
            isUser: updatedUser.isUser()
          }
        });

      } catch (error) {
        if (error.message === 'Utilisateur non trouvé') {
          return res.status(404).json({ message: error.message });
        }
        throw error;
      }

    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Obtenir les statistiques des utilisateurs (admin/moderator)
  static async getUserStats(req, res) {
    try {
      const users = await User.findAll();
      
      const stats = {
        total: users.length,
        admins: users.filter(u => u.isAdmin()).length,
        users: users.filter(u => u.role === 'user').length,
        recentUsers: users.filter(u => {
          const createdAt = new Date(u.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt > thirtyDaysAgo;
        }).length
      };

      res.json({
        message: 'Statistiques utilisateurs récupérées avec succès',
        stats
      });

    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Désactiver un utilisateur (admin seulement)
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ message: 'ID utilisateur invalide' });
      }

      // Empêcher un admin de se désactiver lui-même
      if (parseInt(id) === req.userWithRole.id) {
        return res.status(403).json({ message: 'Vous ne pouvez pas vous désactiver vous-même' });
      }

      const user = await User.findById(parseInt(id));
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Un admin ne peut pas désactiver un autre admin
      if (user.isAdmin() && !req.userWithRole.isAdmin()) {
        return res.status(403).json({ message: 'Seul un admin peut désactiver un autre admin' });
      }

      // Note: Vous devrez ajouter un champ isActive à la table users pour cette fonctionnalité
      // Pour l'instant, nous allons juste retourner un message
      res.json({
        message: 'Fonctionnalité de désactivation nécessite un champ isActive dans la base de données',
        user: user.toJSON()
      });

    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Obtenir la liste des rôles valides
  static async getRoles(req, res) {
    try {
      const roles = User.getValidRoles().map(role => ({
        name: role,
        description: {
          admin: 'Administrateur système avec tous les droits',
          user: 'Utilisateur standard avec droits de base'
        }[role] || 'Rôle standard'
      }));

      res.json({
        message: 'Rôles récupérés avec succès',
        roles
      });

    } catch (error) {
      console.error('Error getting roles:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }

  // Vérifier le rôle de l'utilisateur courant
  static async getCurrentUserRole(req, res) {
    try {
      const user = req.userWithRole || await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.json({
        message: 'Rôle utilisateur récupéré avec succès',
        user: {
          ...user.toJSON(),
          isAdmin: user.isAdmin(),
          isUser: user.isUser(),
          permissions: {
            canManageUsers: user.isAdmin(),
            canViewStats: user.isAdmin(),
            canManageRoles: user.isAdmin()
          }
        }
      });

    } catch (error) {
      console.error('Error getting current user role:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  }
}

module.exports = AdminController;

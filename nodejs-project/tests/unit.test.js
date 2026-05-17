const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Tests Unitaires - Modèle User', () => {
  const testUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'Password123!',
    phone: '+33612345678',
    role: 'user'
  };

  describe('Constructeur User', () => {
    test('devrait créer un utilisateur avec des données valides', () => {
      const user = new User(testUserData);

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.phone).toBe('+33612345678');
      expect(user.role).toBe('user');
      expect(user.password).toBeDefined(); // Devrait être hashé
      expect(user.oldmotp).toBe('Password123!'); // Mot de passe non crypté
      expect(user.id).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('devrait utiliser les valeurs par défaut', () => {
      const user = new User({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'test123'
      });

      expect(user.role).toBe('user');
      expect(user.phone).toBeNull();
    });

    test('devrait gérer les données vides', () => {
      const user = new User({});

      expect(user.firstName).toBe('');
      expect(user.lastName).toBe('');
      expect(user.email).toBe('');
      expect(user.password).toBeNull();
      expect(user.oldmotp).toBeNull();
      expect(user.role).toBe('user');
      expect(user.phone).toBeNull();
    });
  });

  describe('Hashage des mots de passe', () => {
    test('devrait hasher le mot de passe', () => {
      const user = new User(testUserData);

      expect(user.password).not.toBe('Password123!');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // Format bcrypt
    });

    test('devrait vérifier correctement le mot de passe', () => {
      const user = new User(testUserData);

      expect(user.checkPassword('Password123!')).toBe(true);
      expect(user.checkPassword('WrongPassword')).toBe(false);
    });

    test('devrait retourner false pour un mot de passe non défini', () => {
      const user = new User({ firstName: 'Test', email: 'test@example.com' });

      expect(user.checkPassword('anypassword')).toBe(false);
    });

    test('devrait récupérer le mot de passe non crypté', () => {
      const user = new User(testUserData);

      expect(user.getUnencryptedPassword()).toBe('Password123!');
    });
  });

  describe('Validation des données', () => {
    test('devrait valider des données complètes valides', () => {
      const validation = User.validate(testUserData);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('devrait rejeter un prénom trop court', () => {
      const validation = User.validate({
        ...testUserData,
        firstName: 'A'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Le prénom doit contenir au moins 2 caractères');
    });

    test('devrait rejeter un nom trop court', () => {
      const validation = User.validate({
        ...testUserData,
        lastName: 'B'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Le nom doit contenir au moins 2 caractères');
    });

    test('devrait rejeter un email invalide', () => {
      const validation = User.validate({
        ...testUserData,
        email: 'invalid-email'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email invalide');
    });

    test('devrait rejeter un mot de passe trop court', () => {
      const validation = User.validate({
        ...testUserData,
        password: '123'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
    });

    test('devrait rejeter un numéro de téléphone invalide', () => {
      const validation = User.validate({
        ...testUserData,
        phone: 'invalid-phone'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Numéro de téléphone invalide');
    });

    test('devrait rejeter un rôle invalide', () => {
      const validation = User.validate({
        ...testUserData,
        role: 'invalid-role'
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Le rôle doit être l\'un des suivants: admin, user');
    });

    test('devrait accepter des données valides avec téléphone optionnel', () => {
      const validation = User.validate({
        firstName: 'Valid',
        lastName: 'User',
        email: 'valid@example.com',
        password: 'ValidPassword123!'
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Gestion des rôles', () => {
    test('devrait identifier correctement un admin', () => {
      const admin = new User({ ...testUserData, role: 'admin' });

      expect(admin.hasRole('admin')).toBe(true);
      expect(admin.isAdmin()).toBe(true);
      expect(admin.hasRole('user')).toBe(false);
      expect(admin.isUser()).toBe(false);
    });

    test('devrait identifier correctement un utilisateur normal', () => {
      const user = new User({ ...testUserData, role: 'user' });

      expect(user.hasRole('user')).toBe(true);
      expect(user.isUser()).toBe(true);
      expect(user.hasRole('admin')).toBe(false);
      expect(user.isAdmin()).toBe(false);
    });

    test('devrait retourner les rôles valides', () => {
      const validRoles = User.getValidRoles();

      expect(validRoles).toEqual(['admin', 'user']);
    });

    test('devrait valider correctement les rôles', () => {
      expect(User.isValidRole('admin')).toBe(true);
      expect(User.isValidRole('user')).toBe(true);
      expect(User.isValidRole('invalid')).toBe(false);
      expect(User.isValidRole('')).toBe(false);
    });
  });

  describe('Méthode toJSON', () => {
    test('devrait exclure les mots de passe de la sérialisation JSON', () => {
      const user = new User(testUserData);
      const json = user.toJSON();

      expect(json).not.toHaveProperty('password');
      expect(json).not.toHaveProperty('oldmotp');
      expect(json).toHaveProperty('firstName', 'John');
      expect(json).toHaveProperty('lastName', 'Doe');
      expect(json).toHaveProperty('email', 'john.doe@example.com');
      expect(json).toHaveProperty('role', 'user');
    });

    test('devrait inclure les dates formatées en ISO', () => {
      const user = new User(testUserData);
      const json = user.toJSON();

      expect(json.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(json.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('Méthode update', () => {
    test('devrait mettre à jour les propriétés de l\'utilisateur', () => {
      const user = new User(testUserData);
      const originalUpdatedAt = user.updatedAt;

      // Attendre un peu pour que le timestamp change
      setTimeout(() => {
        user.update({
          firstName: 'Updated',
          phone: '+33698765432'
        });

        expect(user.firstName).toBe('Updated');
        expect(user.phone).toBe('+33698765432');
        expect(user.updatedAt).not.toBe(originalUpdatedAt);
      }, 1);
    });
  });
});

describe('Tests Unitaires - Validation', () => {
  describe('Validation des emails', () => {
    test('devrait accepter des emails valides', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        const validation = User.validate({
          firstName: 'Test',
          lastName: 'User',
          email: email,
          password: 'Password123!'
        });
        expect(validation.isValid).toBe(true);
      });
    });

    test('devrait rejeter des emails invalides', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user space@domain.com'
      ];

      invalidEmails.forEach(email => {
        const validation = User.validate({
          firstName: 'Test',
          lastName: 'User',
          email: email,
          password: 'Password123!'
        });
        expect(validation.isValid).toBe(false);
        expect(validation.errors).toContain('Email invalide');
      });
    });
  });

  describe('Validation des mots de passe', () => {
    test('devrait accepter des mots de passe forts', () => {
      const strongPasswords = [
        'Password123!',
        'MySecurePass1@',
        'StrongP@ssw0rd',
        'Complex123#Password'
      ];

      strongPasswords.forEach(password => {
        const validation = User.validate({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: password
        });
        expect(validation.isValid).toBe(true);
      });
    });

    test('devrait rejeter des mots de passe faibles', () => {
      const weakPasswords = [
        'password', // Pas de majuscule, pas de chiffre, pas de caractère spécial
        'PASSWORD', // Pas de minuscule, pas de chiffre, pas de caractère spécial
        '12345678', // Pas de lettre, pas de caractère spécial
        'Password', // Pas de chiffre, pas de caractère spécial
        'Pass123', // Moins de 8 caractères
        'password123', // Pas de majuscule, pas de caractère spécial
        'PASSWORD123', // Pas de minuscule, pas de caractère spécial
        'Password!' // Pas de chiffre
      ];

      weakPasswords.forEach(password => {
        const validation = User.validate({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: password
        });
        expect(validation.isValid).toBe(false);
      });
    });
  });

  describe('Validation des numéros de téléphone', () => {
    test('devrait accepter des numéros valides', () => {
      const validPhones = [
        '+33612345678',
        '+442071234567',
        '+12125551234',
        '0612345678',
        '0123456789'
      ];

      validPhones.forEach(phone => {
        const validation = User.validate({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'Password123!',
          phone: phone
        });
        expect(validation.isValid).toBe(true);
      });
    });

    test('devrait rejeter des numéros invalides', () => {
      const invalidPhones = [
        'abc',
        '123',
        '+12345678901234567890', // Trop long
        'phone-number',
        ''
      ];

      invalidPhones.forEach(phone => {
        const validation = User.validate({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'Password123!',
          phone: phone
        });
        expect(validation.isValid).toBe(false);
      });
    });
  });
});

describe('Tests Unitaires - Utilitaires', () => {
  describe('Formatage des données', () => {
    test('devrait nettoyer les noms et emails', () => {
      const user = new User({
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  JOHN.DOE@EXAMPLE.COM  ',
        password: 'Password123!'
      });

      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john.doe@example.com');
    });

    test('devrait gérer les valeurs null/undefined', () => {
      const user = new User({
        firstName: null,
        lastName: undefined,
        email: 'test@example.com',
        password: 'Password123!',
        phone: null,
        role: undefined
      });

      expect(user.firstName).toBe('');
      expect(user.lastName).toBe('');
      expect(user.email).toBe('test@example.com');
      expect(user.phone).toBeNull();
      expect(user.role).toBe('user');
    });
  });

  describe('Gestion des dates', () => {
    test('devrait créer des dates par défaut', () => {
      const user = new User(testUserData);
      const now = new Date();

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(now.getTime());
    });

    test('devrait utiliser les dates fournies', () => {
      const customDate = new Date('2024-01-01T00:00:00.000Z');
      const user = new User({
        ...testUserData,
        createdAt: customDate,
        updatedAt: customDate
      });

      expect(user.createdAt).toEqual(customDate);
      expect(user.updatedAt).toEqual(customDate);
    });
  });
});

describe('Tests Unitaires - Edge Cases', () => {
  test('devrait gérer les caractères spéciaux dans les noms', () => {
    const user = new User({
      firstName: 'Jean-Michel',
      lastName: 'O\'Connor',
      email: 'jm.oconnor@example.com',
      password: 'Password123!'
    });

    expect(user.firstName).toBe('Jean-Michel');
    expect(user.lastName).toBe('O\'Connor');
    expect(user.email).toBe('jm.oconnor@example.com');
  });

  test('devrait gérer les emails avec des sous-domaines', () => {
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@sub.domain.example.com',
      password: 'Password123!'
    });

    expect(user.email).toBe('user@sub.domain.example.com');
  });

  test('devrait gérer les mots de passe avec des caractères spéciaux variés', () => {
    const specialPasswords = [
      'P@ssw0rd!',
      'Password#123',
      'MyPass$word1',
      'Complex&Pass123'
    ];

    specialPasswords.forEach(password => {
      const user = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: password
      });

      expect(user.checkPassword(password)).toBe(true);
      expect(user.getUnencryptedPassword()).toBe(password);
    });
  });
});

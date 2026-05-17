export class User {
  id?: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  password?: string;
  phone?: string;
  bio?: string;
  role: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  static validate(data: Partial<User>) {
    const errors: string[] = [];

    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email invalide');
    }

    if (!data.password || data.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (data.phone && !/^\+?[1-9]\d{1,14}$/.test(data.phone.replace(/\s/g, ''))) {
      errors.push('Numéro de téléphone invalide');
    }

    if (data.role && !this.isValidRole(data.role)) {
      errors.push('Le rôle doit être l\'un des suivants: ' + this.getValidRoles().join(', '));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    const { password, ...user } = this;
    return user;
  }

  hasRole(roleName: string): boolean {
    return this.role === roleName;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isUser(): boolean {
    return this.role === 'user' || this.isAdmin();
  }

  static getValidRoles(): string[] {
    return ['admin', 'user'];
  }

  static isValidRole(role: string): boolean {
    return this.getValidRoles().includes(role);
  }
}

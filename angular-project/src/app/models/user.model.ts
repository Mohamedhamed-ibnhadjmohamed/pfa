export interface UserSettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  privateSession: boolean;
  publicProfile: boolean;
  emailSearchable: boolean;
  dataSharing: boolean;
  timezone: string;
  dateFormat: string;
}

export class User {
  id?: number;

  firstName!: string;
  lastName!: string;
  email!: string;
  password?: string;

  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  gender?: string;
  language?: string;
  avatar?: string;

  createdAt: string;
  updatedAt: string;

  settings: UserSettings;
  connections: any[];

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();

    this.settings = data.settings || {
      twoFactorEnabled: false,
      emailNotifications: true,
      privateSession: false,
      publicProfile: true,
      emailSearchable: false,
      dataSharing: false,
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY'
    };

    this.connections = data.connections || [];
  }

  static validate(data: Partial<User>) {
    const errors: string[] = [];

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }

    if (
      !data.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    ) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
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
}

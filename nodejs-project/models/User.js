class User {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.phone = data.phone;
    this.bio = data.bio;
    this.location = data.location;
    this.website = data.website;
    this.birthDate = data.birthDate;
    this.gender = data.gender;
    this.language = data.language;
    this.avatar = data.avatar;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.settings = data.settings || {
      twoFactorEnabled: false,
      emailNotifications: true,
      privateSession: false,
      publicProfile: true,
      emailSearchable: false,
      dataSharing: false,
      timezone: "Europe/Paris",
      dateFormat: "DD/MM/YYYY"
    };
    this.connections = data.connections || [];
  }

  static validate(data) {
    const errors = [];
    
    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name is required');
    }
    
    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Last name is required');
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
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
    const user = { ...this };
    delete user.password;
    return user;
  }
}

module.exports = User;

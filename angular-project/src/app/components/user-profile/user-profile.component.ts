import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  @Input() user!: User;
  @Input() showSettings: boolean = false;

  constructor() { }

  ngOnInit(): void {
    if (!this.user) {
      console.error('User data is required');
    }
  }

  // Obtenir le nom complet de l'utilisateur
  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`;
  }

  // Obtenir l'âge de l'utilisateur
  get age(): number | null {
    if (!this.user.birthDate) return null;
    
    const birthDate = new Date(this.user.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Formatter la date de création
  get formattedCreatedAt(): string {
    return new Date(this.user.created_at).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Obtenir les paramètres par défaut si non définis
  get settings(): any {
    return {
      twoFactorEnabled: this.user.twoFactorEnabled || false,
      emailNotifications: this.user.emailNotifications || true,
      privateSession: this.user.privateSession || false,
      publicProfile: this.user.publicProfile || true,
      emailSearchable: this.user.emailSearchable || false,
      dataSharing: this.user.dataSharing || false,
      timezone: this.user.timezone || 'Europe/Paris',
      dateFormat: this.user.dateFormat || 'DD/MM/YYYY'
    };
  }

  // Vérifier si l'utilisateur a une photo de profil
  get hasAvatar(): boolean {
    return !!this.user.avatar;
  }

  // Obtenir l'URL de l'avatar (placeholder si non défini)
  get avatarUrl(): string {
    if (this.user.avatar) {
      return this.user.avatar;
    }
    // Avatar par défaut avec les initiales
    return `https://ui-avatars.com/api/?name=${this.user.firstName}+${this.user.lastName}&background=007bff&color=fff&size=200`;
  }

  // Formatter le numéro de téléphone
  get formattedPhone(): string | null {
    if (!this.user.phone) return null;
    
    // Format français simple
    const phone = this.user.phone.replace(/\s/g, '');
    if (phone.startsWith('+33')) {
      return phone.replace(/(\+33)(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }
    return this.user.phone;
  }

  // Obtenir le texte du genre
  get genderText(): string {
    switch (this.user.gender) {
      case 'Homme': return 'Homme';
      case 'Femme': return 'Femme';
      case 'Autre': return 'Autre';
      default: return 'Non spécifié';
    }
  }

  // Vérifier si le profil est public
  get isPublicProfile(): boolean {
    return this.settings.publicProfile;
  }
}

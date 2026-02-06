import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-profile">
      <div class="page-header">
        <h1>Profil utilisateur</h1>
        <p class="text-muted">Gérez vos informations personnelles</p>
      </div>

      <div class="profile-content">
        <div class="profile-section">
          <div class="avatar-section">
            <div class="avatar-container">
              <img [src]="user?.avatar || defaultAvatar" alt="Avatar" class="avatar">
              <div class="avatar-overlay">
                <label for="avatar-upload" class="avatar-upload-btn">
                  <i class="fas fa-camera"></i>
                </label>
                <input type="file" id="avatar-upload" (change)="onAvatarUpload($event)" accept="image/*">
              </div>
            </div>
          </div>

          <div class="info-section">
            <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input type="text" id="firstName" name="firstName" [(ngModel)]="profile.firstName" required>
                </div>
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input type="text" id="lastName" name="lastName" [(ngModel)]="profile.lastName" required>
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" [(ngModel)]="profile.email" required>
              </div>

              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input type="tel" id="phone" name="phone" [(ngModel)]="profile.phone">
              </div>

              <div class="form-group">
                <label for="bio">Biographie</label>
                <textarea id="bio" name="bio" [(ngModel)]="profile.bio" rows="4"></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="location">Localisation</label>
                  <input type="text" id="location" name="location" [(ngModel)]="profile.location">
                </div>
                <div class="form-group">
                  <label for="website">Site web</label>
                  <input type="url" id="website" name="website" [(ngModel)]="profile.website">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="birthDate">Date de naissance</label>
                  <input type="date" id="birthDate" name="birthDate" [(ngModel)]="profile.birthDate">
                </div>
                <div class="form-group">
                  <label for="gender">Genre</label>
                  <select id="gender" name="gender" [(ngModel)]="profile.gender">
                    <option value="">Sélectionner</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="cancel()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="isLoading">
                  <span *ngIf="isLoading" class="spinner"></span>
                  {{ isLoading ? 'Mise à jour...' : 'Mettre à jour' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  profile: any = {};
  isLoading = false;
  defaultAvatar = 'https://picsum.photos/seed/default/200/200.jpg';

  constructor() {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    console.log('Chargement du profil...');
    
    // Mock user data for demo
    this.user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+33 6 12 34 56 78',
      bio: 'Développeur passionné par les nouvelles technologies.',
      location: 'Paris, France',
      website: 'https://johndoe.dev',
      birthDate: '1990-01-15',
      gender: 'Homme',
      language: 'Français',
      avatar: 'https://picsum.photos/seed/user123/200/200.jpg',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        twoFactorEnabled: false,
        emailNotifications: true,
        privateSession: false,
        publicProfile: true,
        emailSearchable: false,
        dataSharing: false,
        timezone: 'Europe/Paris',
        dateFormat: 'DD/MM/YYYY'
      },
      connections: []
    };
    
    this.profile = { ...this.user };
    console.log('Profil chargé avec succès');
  }

  onAvatarUpload(event: any): void {
    const file = event.target.files[0];
    if (file && this.user) {
      console.log('Téléchargement de l\'avatar...');
      
      // Simuler l'upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarData = e.target?.result as string;
        this.user!.avatar = avatarData;
        this.profile.avatar = avatarData;
        console.log('Avatar mis à jour avec succès');
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    if (!this.user) return;

    this.isLoading = true;
    console.log('Mise à jour du profil...');

    // Simuler la mise à jour
    setTimeout(() => {
      this.user = { ...this.user, ...this.profile };
      this.isLoading = false;
      console.log('Profil mis à jour avec succès');
    }, 1000);
  }

  cancel(): void {
    this.loadUserProfile();
  }
}

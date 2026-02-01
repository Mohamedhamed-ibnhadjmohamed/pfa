import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

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
      
      <div class="row" *ngIf="user; else loading">
        <!-- Avatar Section -->
        <div class="col-md-4 mb-4">
          <div class="avatar-section">
            <div class="avatar-container">
              <img [src]="user.avatar || defaultAvatar" alt="Avatar" class="avatar-large">
              <div class="avatar-overlay">
                <label for="avatar-upload" class="avatar-upload-btn">
                  <i class="fas fa-camera"></i>
                  <span>Changer</span>
                </label>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  (change)="onAvatarUpload($event)"
                  style="display: none;">
              </div>
            </div>
            <div class="avatar-info">
              <h5>{{ user.firstName }} {{ user.lastName }}</h5>
              <p class="text-muted">{{ user.email }}</p>
              <small class="text-info">Cliquez sur l'avatar pour le modifier</small>
            </div>
          </div>
        </div>
        
        <!-- Profile Form -->
        <div class="col-md-8 mb-4">
          <div class="profile-form">
            <h4>Informations personnelles</h4>
            <form (ngSubmit)="updateProfile()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="firstName" class="form-label">Prénom</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="firstName" 
                    [(ngModel)]="profile.firstName"
                    name="firstName">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="lastName" class="form-label">Nom</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="lastName" 
                    [(ngModel)]="profile.lastName"
                    name="lastName">
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  [(ngModel)]="profile.email"
                  name="email">
              </div>
              
              <div class="mb-3">
                <label for="phone" class="form-label">Téléphone</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  [(ngModel)]="profile.phone"
                  name="phone">
              </div>
              
              <div class="mb-3">
                <label for="bio" class="form-label">Biographie</label>
                <textarea 
                  class="form-control" 
                  id="bio" 
                  rows="4"
                  [(ngModel)]="profile.bio"
                  name="bio"
                  placeholder="Parlez-nous de vous..."></textarea>
              </div>
              
              <div class="mb-3">
                <label for="location" class="form-label">Localisation</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="location" 
                  [(ngModel)]="profile.location"
                  name="location"
                  placeholder="Ville, Pays">
              </div>
              
              <div class="mb-3">
                <label for="website" class="form-label">Site web</label>
                <input 
                  type="url" 
                  class="form-control" 
                  id="website" 
                  [(ngModel)]="profile.website"
                  name="website"
                  placeholder="https://example.com">
              </div>
              
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="isLoading">
                  <i class="fas fa-save me-2"></i>
                  <span *ngIf="!isLoading">Enregistrer</span>
                  <span *ngIf="isLoading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    <span>Inscription...</span>
                  </span>
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="cancel()">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Loading Template -->
      <ng-template #loading>
        <div class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="mt-2">Chargement du profil...</p>
        </div>
      </ng-template>
    </div>
  `,
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  profile: any = {};
  isLoading = false;
  defaultAvatar = 'https://picsum.photos/seed/default/200/200.jpg';

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.notificationService.showInfo('Chargement du profil...', 'Profil');
    
    // Mock user data for demo
    this.user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword',
      phone: '+33 6 12 34 56 78',
      bio: 'Développeur Angular passionné',
      location: 'Paris, France',
      website: 'https://johndoe.dev',
      avatar: 'https://picsum.photos/seed/user123/200/200.jpg',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
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
    this.notificationService.showSuccess('Profil chargé avec succès', 'Succès');
  }

  onAvatarUpload(event: any): void {
    const file = event.target.files[0];
    if (file && this.user) {
      this.notificationService.showInfo('Téléchargement de l\'avatar...', 'Avatar');
      
      // Simuler l'upload
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarData = e.target?.result as string;
        this.user!.avatar = avatarData;
        this.profile.avatar = avatarData;
        this.notificationService.showSuccess('Avatar mis à jour avec succès', 'Avatar');
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    if (!this.user) return;

    this.isLoading = true;
    this.notificationService.showInfo('Mise à jour du profil...', 'Profil');

    // Simuler la mise à jour
    setTimeout(() => {
      this.user = { ...this.user, ...this.profile };
      this.isLoading = false;
      this.notificationService.showSuccess('Profil mis à jour avec succès', 'Succès');
    }, 1000);
  }

  cancel(): void {
    this.loadUserProfile();
  }
}

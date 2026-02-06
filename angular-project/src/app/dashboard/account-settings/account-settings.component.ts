import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="account-settings">
      <div class="page-header">
        <h1>Paramètres du compte</h1>
        <p class="text-muted">Gérez les paramètres de votre compte et de sécurité</p>
      </div>
      
      <div class="row">
        <!-- Security Settings -->
        <div class="col-md-6 mb-4">
          <div class="settings-card">
            <h4><i class="fas fa-shield-alt me-2"></i>Sécurité</h4>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Authentification à deux facteurs</h5>
                <p class="text-muted">Ajoutez une couche de sécurité supplémentaire</p>
              </div>
              <div class="setting-control">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="2fa" [(ngModel)]="settings.twoFactorEnabled" (change)="toggle2FA()">
                  <label class="form-check-label" for="2fa"></label>
                </div>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Notifications par email</h5>
                <p class="text-muted">Recevez des alertes par email</p>
              </div>
              <div class="setting-control">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="emailNotif" [(ngModel)]="settings.emailNotifications">
                  <label class="form-check-label" for="emailNotif"></label>
                </div>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Session privée</h5>
                <p class="text-muted">Masquez votre statut en ligne</p>
              </div>
              <div class="setting-control">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="privateSession" [(ngModel)]="settings.privateSession">
                  <label class="form-check-label" for="privateSession"></label>
                </div>
              </div>
            </div>
            
            <div class="mt-3">
              <button class="btn btn-outline-primary btn-sm" (click)="changePassword()">
                <i class="fas fa-key me-2"></i>Changer le mot de passe
              </button>
            </div>
          </div>
        </div>
        
        <!-- Privacy Settings -->
        <div class="col-md-6 mb-4">
          <div class="settings-card">
            <h4><i class="fas fa-user-lock me-2"></i>Confidentialité</h4>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Profil public</h5>
                <p class="text-muted">Rendez votre profil visible par tous</p>
              </div>
              <div class="setting-control">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="publicProfile" [(ngModel)]="settings.publicProfile">
                  <label class="form-check-label" for="publicProfile"></label>
                </div>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Recherche par email</h5>
                <p class="text-muted">Permettez de vous trouver par email</p>
              </div>
              <div class="setting-control">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="emailSearch" [(ngModel)]="settings.emailSearchable">
                  <label class="form-check-label" for="emailSearch"></label>
                </div>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Partage de données</h5>
                <p class="text-muted">Autorisez le partage de données anonymes</p>
              </div>
              <div class="setting-control">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="dataSharing" [(ngModel)]="settings.dataSharing">
                  <label class="form-check-label" for="dataSharing"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Preferences -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="settings-card">
            <h4><i class="fas fa-palette me-2"></i>Préférences</h4>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Langue</h5>
                <p class="text-muted">Choisissez votre langue préférée</p>
              </div>
              <div class="setting-control">
                <select class="form-select form-select-sm" [(ngModel)]="settings.language">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Fuseau horaire</h5>
                <p class="text-muted">Définissez votre fuseau horaire</p>
              </div>
              <div class="setting-control">
                <select class="form-select form-select-sm" [(ngModel)]="settings.timezone">
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Format de date</h5>
                <p class="text-muted">Format d'affichage des dates</p>
              </div>
              <div class="setting-control">
                <select class="form-select form-select-sm" [(ngModel)]="settings.dateFormat">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Danger Zone -->
        <div class="col-md-6 mb-4">
          <div class="settings-card danger-zone">
            <h4><i class="fas fa-exclamation-triangle me-2"></i>Zone de danger</h4>
            
            <div class="alert alert-warning">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Attention:</strong> Ces actions sont irréversibles
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Désactiver le compte</h5>
                <p class="text-muted">Désactivez temporairement votre compte</p>
              </div>
              <div class="setting-control">
                <button class="btn btn-warning btn-sm" (click)="disableAccount()">
                  <i class="fas fa-pause me-2"></i>Désactiver
                </button>
              </div>
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h5>Supprimer le compte</h5>
                <p class="text-muted">Supprimez définitivement votre compte</p>
              </div>
              <div class="setting-control">
                <button class="btn btn-danger btn-sm" (click)="deleteAccount()">
                  <i class="fas fa-trash me-2"></i>Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="settings-actions">
            <button class="btn btn-primary" (click)="saveSettings()">
              <i class="fas fa-save me-2"></i>Enregistrer les paramètres
            </button>
            <button class="btn btn-outline-secondary" (click)="resetSettings()">
              <i class="fas fa-undo me-2"></i>Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent implements OnInit {
  settings = {
    twoFactorEnabled: false,
    emailNotifications: true,
    privateSession: false,
    publicProfile: true,
    emailSearchable: false,
    dataSharing: false,
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY'
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    console.log('Chargement des paramètres...');
  }

  toggle2FA(): void {
    if (this.settings.twoFactorEnabled) {
      console.log('Double authentification activée');
    } else {
      console.log('Double authentification désactivée');
    }
  }

  changePassword(): void {
    console.log('Redirection vers la page de changement de mot de passe...');
    // Dans une vraie application, cela ouvrirait un modal ou naviguerait vers une page dédiée
  }

  saveSettings(): void {
    console.log('Enregistrement des paramètres...');
    setTimeout(() => {
      console.log('Paramètres enregistrés avec succès');
    }, 1000);
  }

  resetSettings(): void {
    this.settings = {
      twoFactorEnabled: false,
      emailNotifications: true,
      privateSession: false,
      publicProfile: true,
      emailSearchable: false,
      dataSharing: false,
      language: 'fr',
      timezone: 'Europe/Paris',
      dateFormat: 'DD/MM/YYYY'
    };
    console.log('Paramètres réinitialisés');
  }

  disableAccount(): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver votre compte ? Vous pourrez le réactiver plus tard.')) {
      console.log('Compte désactivé');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  deleteAccount(): void {
    const confirmation = prompt('Pour supprimer votre compte, tapez "SUPPRIMER" en majuscules :');
    if (confirmation === 'SUPPRIMER') {
      console.log('Compte supprimé définitivement');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } else if (confirmation) {
      console.error('Texte de confirmation incorrect');
    }
  }
}

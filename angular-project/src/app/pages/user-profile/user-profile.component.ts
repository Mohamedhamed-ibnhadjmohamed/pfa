import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isLoading = false;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
  }

  loadUserProfile() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        phone: this.currentUser.phone || ''
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const profileData = this.profileForm.value;

    if (this.currentUser && this.currentUser.id) {
      this.userService.updateProfile(this.currentUser.id, profileData).subscribe({
        next: (response) => {
          this.currentUser = response.user;
          this.isEditing = false;
          this.successMessage = 'Profil mis à jour avec succès!';
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la mise à jour du profil';
          this.isLoading = false;
          console.error('Update profile error:', error);
        }
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.loadUserProfile();
    this.successMessage = '';
    this.errorMessage = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'moderator': 'Modérateur',
      'user': 'Utilisateur',
      'guest': 'Invité'
    };
    return roleMap[role] || role;
  }
}

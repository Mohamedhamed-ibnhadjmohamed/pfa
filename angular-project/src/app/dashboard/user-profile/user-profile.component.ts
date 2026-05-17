import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  isEditing = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          bio: user.bio || ''
        });
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.currentUser && this.currentUser.id) {
      this.userService.updateProfile(this.currentUser.id, this.profileForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Profil mis à jour avec succès !';
          this.isEditing = false;
          this.currentUser = response.user;
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Erreur lors de la mise à jour du profil';
          console.error('Update profile error:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.loadUserProfile();
    this.successMessage = '';
    this.errorMessage = '';
  }
}

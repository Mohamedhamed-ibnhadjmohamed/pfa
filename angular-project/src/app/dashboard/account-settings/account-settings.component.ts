import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss'
})
export class AccountSettingsComponent implements OnInit {
  currentUser: User | null = null;
  settingsForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      language: ['fr', Validators.required],
      timezone: ['Europe/Paris', Validators.required],
      theme: ['light', Validators.required],
      twoFactorAuth: [false]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.settingsForm.patchValue({
          language: 'fr',
          timezone: 'Europe/Paris',
          theme: 'light',
          twoFactorAuth: false
        });
      }
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Simuler la sauvegarde des paramètres
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = 'Paramètres sauvegardés avec succès !';
    }, 2000);
  }
}

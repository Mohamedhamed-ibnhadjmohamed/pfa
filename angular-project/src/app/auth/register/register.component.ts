import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ThemeToggleComponent,
    NavbarComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  submitted = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(128),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
      ]],
      confirmPassword: ['', Validators.required],
      phone: [''],
      newsletter: [true],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePassword(field: 'password' | 'confirmPassword'): void {
    field === 'password'
      ? this.showPassword = !this.showPassword
      : this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    this.isLoading = true;

    const form = this.registerForm.value;

    const normalizedPhone = typeof form.phone === 'string'
      ? form.phone.replace(/\s+/g, '').trim()
      : '';

    const payload: RegisterRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: normalizedPhone || undefined
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || err?.message || "Erreur lors de l'inscription";
      }
    });
  }

  get firstNameErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['firstName'];

    if (control?.errors) {
      if (control.errors['required']) errors.push('Le prénom est requis');
      if (control.errors['minlength']) errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    return errors;
  }

  get lastNameErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['lastName'];

    if (control?.errors) {
      if (control.errors['required']) errors.push('Le nom est requis');
      if (control.errors['minlength']) errors.push('Le nom doit contenir au moins 2 caractères');
    }

    return errors;
  }

  get emailErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['email'];

    if (control?.errors) {
      if (control.errors['required']) errors.push("L'email est requis");
      if (control.errors['email']) errors.push("Format d'email invalide");
    }

    return errors;
  }

  get phoneErrors(): string[] {
    return [];
  }

  get passwordErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['password'];

    if (control?.errors) {
      if (control.errors['required']) errors.push('Le mot de passe est requis');
      if (control.errors['minlength']) errors.push('Le mot de passe doit contenir au moins 8 caractères');
      if (control.errors['maxlength']) errors.push('Le mot de passe ne peut pas dépasser 128 caractères');
      if (control.errors['pattern']) {
        errors.push('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
      }
    }

    return errors;
  }

  get confirmPasswordErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['confirmPassword'];

    if (control?.errors) {
      if (control.errors['required']) errors.push('La confirmation du mot de passe est requise');
    }

    if (this.registerForm?.errors?.['passwordMismatch']) {
      errors.push('Les mots de passe ne correspondent pas');
    }

    return errors;
  }

  get acceptTermsErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['acceptTerms'];

    if (control?.errors) {
      if (control.errors['required']) errors.push("Vous devez accepter les conditions d'utilisation");
      if (control.errors['requiredTrue']) errors.push("Vous devez accepter les conditions d'utilisation");
    }

    return errors;
  }
}

import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ThemeToggleComponent, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  registrationStep = 1;
  maxSteps = 2;
  passwordStrength = 0;
  passwordStrengthText = '';
  isEmailAvailable = false;
  emailCheckTimeout: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)], [this.emailValidator.bind(this)]],
      phone: ['', [Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      
      // Étape 2: Sécurité
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', Validators.required],
      
      // Options
      acceptTerms: [false, Validators.requiredTrue],
      newsletter: [false]
    }, {
      validators: [this.mustMatch('password', 'confirmPassword')]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  // Validations personnalisées
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  emailValidator(control: AbstractControl): Promise<ValidationErrors | null> {
    return new Promise((resolve) => {
      clearTimeout(this.emailCheckTimeout);
      
      this.emailCheckTimeout = setTimeout(() => {
        const email = control.value;
        if (!email || !this.isValidEmailFormat(email)) {
          resolve(null);
          return;
        }

        // Simuler une vérification d'email disponible
        setTimeout(() => {
          const isAvailable = !email.includes('taken'); // Simulation
          this.isEmailAvailable = isAvailable;
          
          if (!isAvailable) {
            resolve({ emailTaken: true });
          } else {
            resolve(null);
          }
        }, 500);
      }, 300);
    });
  }

  // Getters pour les messages d'erreur
  get firstNameErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['firstName'];
    
    if (control?.errors) {
      if (control.errors['required']) errors.push('Le prénom est requis');
      if (control.errors['minlength']) errors.push('Minimum 2 caractères');
      if (control.errors['pattern']) errors.push('Caractères non valides');
    }
    
    return errors;
  }

  get lastNameErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['lastName'];
    
    if (control?.errors) {
      if (control.errors['required']) errors.push('Le nom est requis');
      if (control.errors['minlength']) errors.push('Minimum 2 caractères');
      if (control.errors['pattern']) errors.push('Caractères non valides');
    }
    
    return errors;
  }

  get emailErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['email'];
    
    if (control?.errors) {
      if (control.errors['required']) errors.push('L\'email est requis');
      if (control.errors['email']) errors.push('Format d\'email invalide');
      if (control.errors['pattern']) errors.push('L\'email doit être valide');
      if (control.errors['emailTaken']) errors.push('Cet email est déjà utilisé');
    }
    
    return errors;
  }

  get passwordErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['password'];
    
    if (control?.errors) {
      if (control.errors['required']) errors.push('Le mot de passe est requis');
      if (control.errors['minlength']) errors.push('Minimum 8 caractères');
      if (control.errors['pattern']) errors.push('Doit contenir majuscule, minuscule, chiffre et caractère spécial');
    }
    
    return errors;
  }

  get confirmPasswordErrors(): string[] {
    const errors: string[] = [];
    const control = this.f['confirmPassword'];
    
    if (control?.errors) {
      if (control.errors['required']) errors.push('La confirmation est requise');
      if (control.errors['mustMatch']) errors.push('Les mots de passe ne correspondent pas');
    }
    
    return errors;
  }

  // Méthodes d'interface
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordInput() {
    const password = this.f['password'].value;
    this.calculatePasswordStrength(password);
  }

  private calculatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      return;
    }

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
      extraLength: password.length >= 12
    };

    strength = Object.values(checks).filter(Boolean).length;

    this.passwordStrength = strength;
    
    if (strength <= 2) {
      this.passwordStrengthText = 'Faible';
    } else if (strength <= 4) {
      this.passwordStrengthText = 'Moyen';
    } else {
      this.passwordStrengthText = 'Fort';
    }
  }

  getPasswordStrengthClass(): string {
    if (this.passwordStrength <= 2) return 'text-danger';
    if (this.passwordStrength <= 4) return 'text-warning';
    return 'text-success';
  }

  // Navigation entre étapes
  nextStep() {
    if (this.isCurrentStepValid()) {
      if (this.registrationStep < this.maxSteps) {
        this.registrationStep++;
      }
    } else {
      this.markCurrentStepTouched();
      this.notificationService.showWarning('Veuillez corriger les erreurs avant de continuer', 'Formulaire invalide');
    }
  }

  previousStep() {
    if (this.registrationStep > 1) {
      this.registrationStep--;
    }
  }

  private isCurrentStepValid(): boolean {
    if (this.registrationStep === 1) {
      return this.f['firstName'].valid && this.f['lastName'].valid && this.f['email'].valid;
    } else if (this.registrationStep === 2) {
      return this.f['password'].valid && this.f['confirmPassword'].valid && this.f['acceptTerms'].value;
    }
    return false;
  }

  private markCurrentStepTouched(): void {
    if (this.registrationStep === 1) {
      this.f['firstName'].markAsTouched();
      this.f['lastName'].markAsTouched();
      this.f['email'].markAsTouched();
    } else if (this.registrationStep === 2) {
      this.f['password'].markAsTouched();
      this.f['confirmPassword'].markAsTouched();
      this.f['acceptTerms'].markAsTouched();
    }
  }

  // Soumission du formulaire
  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.notificationService.showWarning('Veuillez remplir tous les champs correctement', 'Formulaire invalide');
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    // Validation supplémentaire
    const { firstName, lastName, email, password } = this.registerForm.value;

    if (!this.validateName(firstName) || !this.validateName(lastName)) {
      this.notificationService.showError('Le nom ne peut contenir que des lettres', 'Erreur de validation');
      return;
    }

    if (!this.validateEmail(email)) {
      this.notificationService.showError('Format d\'email invalide', 'Erreur de validation');
      return;
    }

    if (!this.validatePassword(password)) {
      this.notificationService.showError('Le mot de passe ne respecte pas les critères de sécurité', 'Erreur de validation');
      return;
    }

    this.isLoading = true;
    this.notificationService.showInfo('Création du compte en cours...', 'Inscription');

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      phone: this.f['phone'].value?.trim() || '',
      newsletter: this.f['newsletter'].value
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.showSuccess('Compte créé avec succès !', 'Inscription réussie');
        
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleRegistrationError(error);
      }
    });
  }

  private handleRegistrationError(error: any): void {
    if (error.status === 409) {
      this.notificationService.showError('Cet email est déjà utilisé', 'Erreur d\'inscription');
    } else if (error.status === 400) {
      this.notificationService.showError('Données invalides', 'Erreur de validation');
    } else {
      this.notificationService.showError('Une erreur est survenue lors de l\'inscription', 'Erreur serveur');
    }
  }

  // Validations
  private validateName(name: string): boolean {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name.trim());
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private validatePassword(password: string): boolean {
    // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  private isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Utilitaires
  getProgressPercentage(): number {
    return (this.registrationStep / this.maxSteps) * 100;
  }

  isStepCompleted(step: number): boolean {
    return step < this.registrationStep;
  }

  isStepActive(step: number): boolean {
    return step === this.registrationStep;
  }
}

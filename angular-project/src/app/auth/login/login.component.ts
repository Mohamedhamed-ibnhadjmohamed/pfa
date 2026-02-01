import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ThemeToggleComponent, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  rememberMe = false;
  loginAttempts = 0;
  maxLoginAttempts = 3;
  isBlocked = false;
  blockTimeRemaining = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]],
      rememberMe: [false]
    });

    // Vérifier si l'utilisateur était bloqué
    const blockedUntil = localStorage.getItem('blockedUntil');
    if (blockedUntil && new Date(blockedUntil) > new Date()) {
      this.isBlocked = true;
      this.updateBlockTimeRemaining();
    }
  }

  ngOnInit(): void {
    // Vérifier s'il y a une route intentionnelle
    const intendedRoute = localStorage.getItem('intendedRoute');
    if (intendedRoute) {
      this.notificationService.showInfo('Veuillez vous connecter pour accéder à la page demandée', 'Authentification requise');
    }

    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    // Démarrer le compte à rebours si bloqué
    if (this.isBlocked) {
      this.startBlockCountdown();
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  get emailErrors(): string[] {
    const errors: string[] = [];
    const emailControl = this.f['email'];
    
    if (emailControl?.errors) {
      if (emailControl.errors['required']) errors.push('L\'email est requis');
      if (emailControl.errors['email']) errors.push('Format d\'email invalide');
      if (emailControl.errors['pattern']) errors.push('L\'email doit être valide');
    }
    
    return errors;
  }

  get passwordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.f['password'];
    
    if (passwordControl?.errors) {
      if (passwordControl.errors['required']) errors.push('Le mot de passe est requis');
      if (passwordControl.errors['minlength']) errors.push('Minimum 6 caractères');
      if (passwordControl.errors['pattern']) errors.push('Doit contenir majuscule, minuscule et chiffre');
    }
    
    return errors;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    // Vérifier si l'utilisateur est bloqué
    if (this.isBlocked) {
      this.notificationService.showError('Compte temporairement bloqué. Veuillez réessayer plus tard.', 'Compte bloqué');
      return;
    }

    // Validation du formulaire
    if (this.loginForm.invalid) {
      this.notificationService.showWarning('Veuillez corriger les erreurs dans le formulaire', 'Formulaire invalide');
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;
    this.rememberMe = rememberMe;

    // Validation supplémentaire
    if (!this.validateEmail(email)) {
      this.notificationService.showError('Format d\'email invalide', 'Erreur de validation');
      return;
    }

    if (!this.validatePassword(password)) {
      this.notificationService.showError('Le mot de passe ne respecte pas les critères de sécurité', 'Erreur de validation');
      return;
    }

    this.isLoading = true;
    this.notificationService.showInfo('Tentative de connexion en cours...', 'Connexion');

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.loginAttempts = 0; // Réinitialiser les tentatives
        
        // Sauvegarder l'état "remember me"
        if (this.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        this.notificationService.showSuccess('Connexion réussie !', 'Bienvenue');
        
        // Rediriger vers la page demandée ou le dashboard
        const intendedRoute = localStorage.getItem('intendedRoute');
        setTimeout(() => {
          if (intendedRoute) {
            localStorage.removeItem('intendedRoute');
            this.router.navigate([intendedRoute]);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginError(error: any): void {
    this.loginAttempts++;
    
    if (this.loginAttempts >= this.maxLoginAttempts) {
      this.blockAccount();
    } else {
      const remainingAttempts = this.maxLoginAttempts - this.loginAttempts;
      this.notificationService.showError(
        `Échec de connexion. ${remainingAttempts} tentative(s) restante(s)`,
        'Erreur de connexion'
      );
    }
  }

  private blockAccount(): void {
    this.isBlocked = true;
    const blockDuration = 5 * 60 * 1000; // 5 minutes en millisecondes
    const blockedUntil = new Date(Date.now() + blockDuration);
    
    localStorage.setItem('blockedUntil', blockedUntil.toISOString());
    localStorage.setItem('loginAttempts', this.loginAttempts.toString());
    
    this.notificationService.showError(
      'Trop de tentatives de connexion. Compte bloqué pour 5 minutes.',
      'Compte bloqué'
    );
    
    this.startBlockCountdown();
  }

  private startBlockCountdown(): void {
    const interval = setInterval(() => {
      this.updateBlockTimeRemaining();
      
      if (this.blockTimeRemaining <= 0) {
        this.isBlocked = false;
        this.loginAttempts = 0;
        localStorage.removeItem('blockedUntil');
        localStorage.removeItem('loginAttempts');
        clearInterval(interval);
        this.notificationService.showInfo('Compte débloqué. Vous pouvez maintenant vous connecter.', 'Compte débloqué');
      }
    }, 1000);
  }

  private updateBlockTimeRemaining(): void {
    const blockedUntil = localStorage.getItem('blockedUntil');
    if (blockedUntil) {
      const remaining = new Date(blockedUntil).getTime() - Date.now();
      this.blockTimeRemaining = Math.max(0, Math.floor(remaining / 1000));
    }
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    // Au moins 6 caractères, une majuscule, une minuscule et un chiffre
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getBlockTimeText(): string {
    const minutes = Math.floor(this.blockTimeRemaining / 60);
    const seconds = this.blockTimeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  forgotPassword(): void {
    this.notificationService.showInfo('Redirection vers la page de récupération de mot de passe...', 'Mot de passe oublié');
    // Dans une vraie application, naviguer vers la page de récupération
  }
}

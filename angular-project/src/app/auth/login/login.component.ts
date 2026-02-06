import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { StorageUtil } from '../../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Vérifier si l'utilisateur était bloqué
    if (isPlatformBrowser(this.platformId)) {
      const blockedUntil = StorageUtil.getItem('blockedUntil');
      if (blockedUntil && new Date(blockedUntil) > new Date()) {
        this.isBlocked = true;
        this.updateBlockTimeRemaining();
      }
    }
  }

  ngOnInit(): void {
    // Vérifier s'il y a une route intentionnelle
    if (isPlatformBrowser(this.platformId)) {
      const intendedRoute = StorageUtil.getItem('intendedRoute');
      if (intendedRoute) {
        console.log('Veuillez vous connecter pour accéder à la page demandée');
      }
    }

    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isAuthenticated()) {
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
    }
    
    return errors;
  }

  get passwordErrors(): string[] {
    const errors: string[] = [];
    const passwordControl = this.f['password'];
    
    if (passwordControl?.errors) {
      if (passwordControl.errors['required']) errors.push('Le mot de passe est requis');
      if (passwordControl.errors['minlength']) errors.push('Minimum 6 caractères');
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
      console.error('Compte temporairement bloqué. Veuillez réessayer plus tard.');
      return;
    }

    // Validation du formulaire
    if (this.loginForm.invalid) {
      console.warn('Veuillez corriger les erreurs dans le formulaire');
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;
    this.rememberMe = rememberMe;

    // Validation supplémentaire
    if (!this.validateEmail(email)) {
      console.error('Format d\'email invalide');
      return;
    }

    this.isLoading = true;
    console.log('Tentative de connexion en cours...');

    // Envoyer les données de connexion au serveur
    this.authService.login({ 
      email, 
      password
    }).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.loginAttempts = 0; // Réinitialiser les tentatives
        this.errorMessage = '';
        
        // Sauvegarder l'état "remember me"
        if (this.rememberMe && isPlatformBrowser(this.platformId)) {
          StorageUtil.setItem('rememberMe', 'true');
        } else if (isPlatformBrowser(this.platformId)) {
          StorageUtil.removeItem('rememberMe');
        }

        console.log('Connexion réussie !');
        
        // Rediriger vers la page demandée ou le dashboard
        const targetRoute = isPlatformBrowser(this.platformId)
          ? (StorageUtil.getItem('intendedRoute') || '/dashboard')
          : '/dashboard';

        if (isPlatformBrowser(this.platformId)) {
          StorageUtil.removeItem('intendedRoute');
        }

        // `AuthService` a déjà sauvegardé token/refreshToken/currentUser
        // via son `tap(handleAuthSuccess)`.
        this.router.navigate([targetRoute]);
      },
      error: (error: string) => {
        this.isLoading = false;
        this.errorMessage = error;
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
      console.error(`Échec de connexion. ${remainingAttempts} tentative(s) restante(s)`);
    }
  }

  private blockAccount(): void {
    this.isBlocked = true;
    const blockDuration = 5 * 60 * 1000; // 5 minutes en millisecondes
    const blockedUntil = new Date(Date.now() + blockDuration);
    
    if (isPlatformBrowser(this.platformId)) {
      StorageUtil.setItem('blockedUntil', blockedUntil.toISOString());
      StorageUtil.setItem('loginAttempts', this.loginAttempts.toString());
    }
    
    console.error(
      'Trop de tentatives de connexion. Compte bloqué pour 5 minutes.'
    );
    
    this.startBlockCountdown();
  }

  private startBlockCountdown(): void {
    const interval = setInterval(() => {
      this.updateBlockTimeRemaining();
      
      if (this.blockTimeRemaining <= 0) {
        this.isBlocked = false;
        this.loginAttempts = 0;
        if (isPlatformBrowser(this.platformId)) {
          StorageUtil.removeItem('blockedUntil');
          StorageUtil.removeItem('loginAttempts');
        }
        clearInterval(interval);
        console.log('Compte débloqué. Vous pouvez maintenant vous connecter.');
      }
    }, 1000);
  }

  private updateBlockTimeRemaining(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const blockedUntil = StorageUtil.getItem('blockedUntil');
    if (blockedUntil) {
      const remaining = new Date(blockedUntil).getTime() - Date.now();
      this.blockTimeRemaining = Math.max(0, Math.floor(remaining / 1000));
    }
  }

  private validateEmail(email: string): boolean {
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

  getBlockTimeText(): string {
    const minutes = Math.floor(this.blockTimeRemaining / 60);
    const seconds = this.blockTimeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  forgotPassword(): void {
    console.log('Redirection vers la page de récupération de mot de passe...');
    // Dans une vraie application, naviguer vers la page de récupération
  }
}

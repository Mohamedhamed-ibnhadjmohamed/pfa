import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService, LoginRequest } from '../../services/user.service';
import { StorageUtil } from '../../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, ThemeToggleComponent, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });

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
    if (this.userService.getCurrentUser() !== null) {
      this.router.navigate(['/dashboard']);
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

    console.log('=== LOGIN DEBUG ===');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form values:', this.loginForm.value);


    // Validation du formulaire
    if (this.loginForm.invalid) {
      console.warn('Veuillez corriger les erreurs dans le formulaire');
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;
    this.rememberMe = rememberMe;

    console.log('Credentials:', { email, password: '***', rememberMe });

    // Validation supplémentaire
    if (!this.validateEmail(email)) {
      console.error('Format d\'email invalide');
      return;
    }

    this.isLoading = true;
    console.log('Tentative de connexion en cours...');

    // Envoyer les données de connexion au serveur
    console.log('Sending request to:', 'http://localhost:3000/api/auth/login');
    
    this.userService.login({ 
      email, 
      password,
      device: this.getDeviceInfo(),
      location: 'Web Application'
    }).subscribe({
      next: (response: {message: string, user: User}) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        this.errorMessage = '';
        
        // Sauvegarder l'état "remember me"
        if (this.rememberMe && isPlatformBrowser(this.platformId)) {
          StorageUtil.setItem('rememberMe', 'true');
        } else if (isPlatformBrowser(this.platformId)) {
          StorageUtil.removeItem('rememberMe');
        }

        console.log('Connexion réussie !');
        
        // Rediriger selon le rôle de l'utilisateur
        this.redirectBasedOnRole(response.user);
      },
      error: (error: string) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error;
      }
    });
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


  private redirectBasedOnRole(user: User): void {
    // Vérifier d'abord s'il y a une route intentionnelle
    const intendedRoute = isPlatformBrowser(this.platformId)
      ? StorageUtil.getItem('intendedRoute')
      : null;

    if (intendedRoute) {
      if (isPlatformBrowser(this.platformId)) {
        StorageUtil.removeItem('intendedRoute');
      }
      this.router.navigate([intendedRoute]);
      return;
    }

    // Redirection selon le rôle
    if (user.isAdmin()) {
      console.log('Redirection vers le dashboard admin');
      this.router.navigate(['/admin/dashboard']);
    } else {
      console.log('Redirection vers le dashboard utilisateur');
      this.router.navigate(['/dashboard']);
    }
  }

  private getDeviceInfo(): string {
    if (!isPlatformBrowser(this.platformId)) return 'Server';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mobile')) {
      return 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  forgotPassword(): void {
    console.log('Redirection vers la page de récupération de mot de passe...');
    // Dans une vraie application, naviguer vers la page de récupération
    this.router.navigate(['/forgot-password']);
  }
}

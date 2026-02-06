import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { StorageUtil } from '../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // En SSR, autoriser l'accès pour éviter les erreurs
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    
    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = this.checkAuthentication();
    
    if (!isAuthenticated) {
      // Rediriger vers la page de login
      
      // Sauvegarder l'URL demandée pour redirection après login
      StorageUtil.setItem('intendedRoute', state.url);
      
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier si l'utilisateur a les permissions nécessaires
    const requiredRole = route.data['role'];
    if (requiredRole && !this.hasRequiredRole(requiredRole)) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  private checkAuthentication(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = this.authService.getToken();
    const user = StorageUtil.getItem('currentUser');
    
    if (!token || !user) {
      return false;
    }

    // Vérifier si le token est expiré
    if (this.isTokenExpired(token)) {
      this.authService.logout();
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      // Dans une vraie application, décoder le JWT token
      // Pour la démo, on simule une expiration
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convertir en milliseconds
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      return true; // Si erreur, considérer comme expiré
    }
  }

  private hasRequiredRole(requiredRole: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const user = JSON.parse(StorageUtil.getItem('currentUser') || '{}');
    return user.role === requiredRole || user.role === 'admin';
  }

  public logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

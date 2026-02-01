import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Vérifier si l'utilisateur est authentifié
    const isAuthenticated = this.checkAuthentication();
    
    if (!isAuthenticated) {
      // Rediriger vers la page de login
      this.notificationService.showWarning('Vous devez être connecté pour accéder à cette page', 'Authentification requise');
      
      // Sauvegarder l'URL demandée pour redirection après login
      localStorage.setItem('intendedRoute', state.url);
      
      this.router.navigate(['/login']);
      return false;
    }

    // Vérifier si l'utilisateur a les permissions nécessaires
    const requiredRole = route.data['role'];
    if (requiredRole && !this.hasRequiredRole(requiredRole)) {
      this.notificationService.showError('Vous n\'avez pas les permissions nécessaires pour accéder à cette page', 'Accès refusé');
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }

  private checkAuthentication(): boolean {
    // Vérifier le token d'authentification
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (!token || !user) {
      return false;
    }

    // Vérifier si le token est expiré
    if (this.isTokenExpired(token)) {
      this.logout();
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
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.role === requiredRole || user.role === 'admin';
  }

  public logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.notificationService.showInfo('Vous avez été déconnecté', 'Déconnexion');
    this.router.navigate(['/login']);
  }

  public refreshToken(): boolean {
    // Dans une vraie application, rafraîchir le token
    const currentToken = localStorage.getItem('authToken');
    if (!currentToken) {
      return false;
    }

    // Simuler un rafraîchissement de token
    const newToken = this.generateMockToken();
    localStorage.setItem('authToken', newToken);
    return true;
  }

  private generateMockToken(): string {
    // Générer un faux token pour la démo
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: 'user123',
      role: 'user',
      iat: Date.now() / 1000,
      exp: (Date.now() + 3600000) / 1000 // Expire dans 1 heure
    }));
    const signature = 'mock-signature';
    
    return `${header}.${payload}.${signature}`;
  }
}

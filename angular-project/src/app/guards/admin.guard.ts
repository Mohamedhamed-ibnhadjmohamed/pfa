import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('AdminGuard: Aucun utilisateur trouvé');
      this.router.navigate(['/login']);
      return false;
    }

    if (!currentUser.isAdmin()) {
      console.error('AdminGuard: L\'utilisateur n\'est pas un admin');
      this.router.navigate(['/dashboard']); // Rediriger vers le dashboard normal
      return false;
    }

    console.log('AdminGuard: Accès autorisé pour l\'admin');
    return true;
  }
}

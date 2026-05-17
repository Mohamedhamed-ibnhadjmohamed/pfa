import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ModeratorGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      console.error('ModeratorGuard: Aucun utilisateur trouvé');
      this.router.navigate(['/login']);
      return false;
    }

    if (!currentUser.isModerator()) {
      console.error('ModeratorGuard: L\'utilisateur n\'a pas les droits de modérateur');
      this.router.navigate(['/dashboard']); // Rediriger vers le dashboard normal
      return false;
    }

    console.log('ModeratorGuard: Accès autorisé pour le modérateur');
    return true;
  }
}

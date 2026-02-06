import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Ne pas ajouter le token pour les requêtes d'authentification
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // Cloner la requête et ajouter le header d'autorisation
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${authService.getToken()}`)
  });

  return next(authReq).pipe(
    catchError(error => {
      // Gérer les erreurs 401 (token expiré)
      if (error.status === 401) {
        // Tenter de rafraîchir le token
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retenter la requête originale avec le nouveau token
            const newAuthReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${authService.getToken()}`)
            });
            return next(newAuthReq);
          }),
          catchError(refreshError => {
            // Si le refresh échoue, déconnecter l'utilisateur
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

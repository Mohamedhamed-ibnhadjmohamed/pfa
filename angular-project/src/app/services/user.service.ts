import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { StorageUtil } from '../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

export { User } from '../models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
  device?: string;
  location?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';
  private currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Authentification
  login(credentials: LoginRequest): Observable<{message: string, user: User}> {
    return this.http.post<{message: string, user: User}>(`${this.API_URL}/auth/login`, credentials).pipe(
      map(response => {
        this.currentUser = response.user;
        this.saveToLocalStorage(response.user);
        return response;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error.error?.message || 'Erreur de connexion');
      })
    );
  }

  register(userData: RegisterRequest): Observable<{message: string, user: User}> {
    return this.http.post<{message: string, user: User}>(`${this.API_URL}/users`, userData).pipe(
      map(response => {
        this.currentUser = response.user;
        this.saveToLocalStorage(response.user);
        return response;
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error.error?.message || 'Erreur d\'inscription');
      })
    );
  }

  // Gestion du profil
  getCurrentUser(): Observable<User | null> {
    if (this.currentUser) {
      return of(this.currentUser);
    }

    if (isPlatformBrowser(this.platformId)) {
      const storedUser = StorageUtil.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return of(this.currentUser);
      }
    }
    return of(null);
  }

  updateProfile(userId: number, profileData: Partial<User>): Observable<{message: string, user: User}> {
    return this.http.put<{message: string, user: User}>(`${this.API_URL}/users/${userId}`, profileData).pipe(
      map(response => {
        this.currentUser = response.user;
        this.saveToLocalStorage(response.user);
        return response;
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error.error?.message || 'Erreur de mise à jour');
      })
    );
  }

  // CRUD methods for admin dashboard
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      catchError(error => {
        console.error('Get all users error:', error);
        return throwError(() => error.error?.message || 'Erreur lors du chargement des utilisateurs');
      })
    );
  }

  createUser(userData: any): Observable<{message: string, user: User}> {
    return this.http.post<{message: string, user: User}>(`${this.API_URL}/users`, userData).pipe(
      catchError(error => {
        console.error('Create user error:', error);
        return throwError(() => error.error?.message || 'Erreur lors de la création de l\'utilisateur');
      })
    );
  }

  updateUser(userId: number, userData: any): Observable<{message: string, user: User}> {
    return this.http.put<{message: string, user: User}>(`${this.API_URL}/users/${userId}`, userData).pipe(
      catchError(error => {
        console.error('Update user error:', error);
        return throwError(() => error.error?.message || 'Erreur lors de la mise à jour de l\'utilisateur');
      })
    );
  }

  deleteUser(userId: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.API_URL}/users/${userId}`).pipe(
      catchError(error => {
        console.error('Delete user error:', error);
        return throwError(() => error.error?.message || 'Erreur lors de la suppression de l\'utilisateur');
      })
    );
  }


  // Déconnexion
  logout(): void {
    this.currentUser = null;
    if (isPlatformBrowser(this.platformId)) {
      StorageUtil.removeItem('currentUser');
    }
  }

  // Méthodes privées
  private saveToLocalStorage(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      StorageUtil.setItem('currentUser', JSON.stringify(user));
    }
  }
}

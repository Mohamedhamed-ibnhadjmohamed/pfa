import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  gender?: string;
  language?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
  connections: Connection[];
}

export interface UserSettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  privateSession: boolean;
  publicProfile: boolean;
  emailSearchable: boolean;
  dataSharing: boolean;
  timezone: string;
  dateFormat: string;
}

export interface Connection {
  id: number;
  date: string;
  device: 'desktop' | 'mobile' | 'tablet';
  location: string;
  ipAddress: string;
  browser: string;
  status: 'success' | 'failed';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = 'http://localhost:3000/api';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  // Authentification
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/auth/login`, credentials).pipe(
      map(user => {
        this.currentUser = user;
        this.saveToLocalStorage(user);
        return user;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error.error?.message || 'Erreur de connexion');
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, userData).pipe(
      map(user => {
        this.currentUser = user;
        this.saveToLocalStorage(user);
        return user;
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

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      return of(this.currentUser);
    }

    return of(null);
  }

  updateProfile(userId: number, profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${userId}`, profileData).pipe(
      map(user => {
        this.currentUser = user;
        this.saveToLocalStorage(user);
        return user;
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error.error?.message || 'Erreur de mise à jour');
      })
    );
  }

  updateSettings(userId: number, settings: Partial<UserSettings>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${userId}`, { settings }).pipe(
      map(user => {
        this.currentUser = user;
        this.saveToLocalStorage(user);
        return user;
      }),
      catchError(error => {
        console.error('Update settings error:', error);
        return throwError(() => error.error?.message || 'Erreur de mise à jour');
      })
    );
  }

  // Avatar upload
  updateAvatar(userId: number, avatarData: string): Observable<User> {
    return this.updateProfile(userId, { avatar: avatarData });
  }

  // Historique des connexions
  getConnectionHistory(userId: number): Observable<Connection[]> {
    return this.http.get<User>(`${this.API_URL}/users/${userId}`).pipe(
      map(user => {
        return user.connections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }),
      catchError(error => {
        console.error('Get connection history error:', error);
        return throwError(() => error.error?.message || 'Erreur de récupération');
      })
    );
  }

  // Déconnexion
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Méthodes privées
  private saveToLocalStorage(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

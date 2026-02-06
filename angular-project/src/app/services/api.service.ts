import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StorageUtil } from '../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
  bio?: string;
  location?: string;
  website?: string;
  birthDate?: string;
  gender?: 'Homme' | 'Femme' | 'Autre';
  language?: string;
}

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
  language: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (isPlatformBrowser(this.platformId)) {
      const token = StorageUtil.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      let errorMessage = 'Une erreur est survenue';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Non autorisé - Veuillez vous reconnecter';
        if (isPlatformBrowser(this.platformId)) {
          StorageUtil.removeItem('token');
          StorageUtil.removeItem('refreshToken');
        }
      } else if (error.status === 403) {
        errorMessage = 'Accès refusé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      } else if (error.status >= 500) {
        errorMessage = 'Erreur serveur - Veuillez réessayer plus tard';
      }
      
      return throwError(() => ({ error: errorMessage, status: error.status }));
    };
  }

  // Authentification
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => response),
        catchError(this.handleError<AuthResponse>('login'))
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        map(response => response),
        catchError(this.handleError<AuthResponse>('register'))
      );
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot refresh token in SSR'));
    }
    
    const refreshToken = StorageUtil.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<{ token: string; refreshToken: string }>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        catchError(this.handleError<{ token: string; refreshToken: string }>('refreshToken'))
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        catchError(this.handleError<void>('logout'))
      );
  }

  // Utilisateurs
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<User[]>('getAllUsers', []))
      );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<User>('getUserById'))
      );
  }

  createUser(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<User>('createUser'))
      );
  }

  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, userData, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<User>('updateUser'))
      );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<void>('deleteUser'))
      );
  }

  addConnection(userId: number, connectionData: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/connections`, connectionData, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<void>('addConnection'))
      );
  }

  // Utilitaires
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    
    const token = StorageUtil.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    const userStr = StorageUtil.getItem('currentUser');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      StorageUtil.setItem('currentUser', JSON.stringify(user));
    }
  }

  setTokens(token: string, refreshToken: string): void {
    if (isPlatformBrowser(this.platformId)) {
      StorageUtil.setItem('token', token);
      StorageUtil.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      StorageUtil.removeItem('token');
      StorageUtil.removeItem('refreshToken');
      StorageUtil.removeItem('currentUser');
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from './user.service';

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

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'auth_token';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error.error?.message || 'Erreur de connexion');
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData).pipe(
      tap(response => {
        this.setToken(response.token);
        this.currentUser = response.user;
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error.error?.message || "Erreur d'inscription");
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    const savedUser = localStorage.getItem('currentUser');
    
    if (token && savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        this.removeToken();
        localStorage.removeItem('currentUser');
      }
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, {}).pipe(
      tap(response => {
        this.setToken(response.token);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => 'Session expirée, veuillez vous reconnecter');
      })
    );
  }
}

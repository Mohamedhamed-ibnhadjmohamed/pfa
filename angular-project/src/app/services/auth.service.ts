import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

import { User } from '../models/user.model';
import { StorageUtil } from '../utils/storage.util';

/* =======================
   Interfaces
======================= */

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
  refreshToken: string;
}

/* =======================
   Service
======================= */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadUserFromStorage();
  }

  /* =======================
     Auth
  ======================= */

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => this.handleError(err, 'Erreur de connexion'))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(res => this.handleAuthSuccess(res)),
      catchError(err => this.handleError(err, "Erreur d'inscription"))
    );
  }

  logout(): void {
    this.clearSession();
  }

  /* =======================
     Token
  ======================= */

  refreshToken(): Observable<{ message: string; token: string }> {
    const token = this.getRefreshToken();

    if (!token) {
      this.logout();
      return throwError(() => 'Refresh token manquant');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<{ message: string; token: string }>(
      `${this.API_URL}/refresh`,
      {},
      { headers }
    ).pipe(
      tap(res => this.setToken(res.token)),
      catchError(err => {
        this.logout();
        return throwError(() => 'Session expirée');
      })
    );
  }

  /* =======================
     Utils
  ======================= */

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return StorageUtil.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return StorageUtil.getItem(this.REFRESH_TOKEN_KEY);
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`
    });
  }

  /* =======================
     Private helpers
  ======================= */

  private handleAuthSuccess(res: AuthResponse): void {
    this.setToken(res.token);
    this.setRefreshToken(res.refreshToken);
    this.currentUser = res.user;
    StorageUtil.setItem('currentUser', JSON.stringify(res.user));
  }

  private setToken(token: string): void {
    StorageUtil.setItem(this.TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    StorageUtil.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private clearSession(): void {
    StorageUtil.removeItem(this.TOKEN_KEY);
    StorageUtil.removeItem(this.REFRESH_TOKEN_KEY);
    StorageUtil.removeItem('currentUser');
    this.currentUser = null;
  }

  private loadUserFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = StorageUtil.getItem('currentUser');
    if (user) {
      try {
        this.currentUser = JSON.parse(user);
      } catch {
        this.clearSession();
      }
    }
  }

  private handleError(error: any, fallback: string) {
    console.error(error);
    const backend = error?.error;
    if (backend?.errors?.length) {
      const first = backend.errors[0];
      const param = first?.param ? `${first.param}: ` : '';
      const msg = first?.msg || backend.message;
      return throwError(() => `${param}${msg}` || fallback);
    }

    return throwError(() => backend?.message || fallback);
  }
}

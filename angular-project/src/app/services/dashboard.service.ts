import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface DashboardStats {
  profileCompletion: number;
  securityStatus: string;
  securityClass: string;
  securityIcon: string;
  securityText: string;
  monthlyConnections: number;
  lastConnection: string;
  memberSince: string;
  lastLogin: string;
}

export interface Activity {
  type: 'success' | 'info' | 'warning' | 'error';
  icon: string;
  title: string;
  description: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getDashboardStats(userId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard/${userId}/stats`).pipe(
      catchError(error => {
        console.error('Error loading dashboard stats:', error);
        return this.getMockDashboardStats();
      })
    );
  }

  getRecentActivities(userId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.API_URL}/dashboard/${userId}/activities`).pipe(
      catchError(error => {
        console.error('Error loading activities:', error);
        return this.getMockActivities();
      })
    );
  }

  private getMockDashboardStats(): Observable<DashboardStats> {
    return of({
      profileCompletion: 85,
      securityStatus: 'Sécurisé',
      securityClass: 'text-success',
      securityIcon: 'fas fa-shield-alt',
      securityText: 'Sécurisé',
      monthlyConnections: 12,
      lastConnection: "Aujourd'hui",
      memberSince: 'Janvier 2024',
      lastLogin: "Aujourd'hui à 14:30"
    });
  }

  private getMockActivities(): Observable<Activity[]> {
    return of([
      {
        type: 'success',
        icon: 'fas fa-user-check',
        title: 'Profil mis à jour',
        description: 'Vos informations personnelles ont été mises à jour',
        time: 'Il y a 2 heures'
      },
      {
        type: 'info',
        icon: 'fas fa-sign-in-alt',
        title: 'Nouvelle connexion',
        description: 'Connexion depuis Chrome sur Windows',
        time: 'Il y a 5 heures'
      },
      {
        type: 'warning',
        icon: 'fas fa-key',
        title: 'Sécurité',
        description: 'Pensez à mettre à jour votre mot de passe',
        time: 'Hier'
      }
    ]);
  }
}

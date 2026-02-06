import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface DashboardStats {
  profileCompletion: number;
  securityStatus: string;
  securityClass: string;
  securityIcon: string;
  securityText: string;
  monthlyConnections: number;
  lastConnection: string;
  unreadNotifications: number;
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

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: Activity[];
  unreadCount: number;
  isUserOnline: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getDashboardData(userId: number): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.API_URL}/dashboard/${userId}`).pipe(
      catchError(error => {
        console.error('Error loading dashboard data:', error);
        return this.getMockDashboardData();
      })
    );
  }

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
        console.error('Error loading recent activities:', error);
        return this.getMockActivities();
      })
    );
  }

  getUnreadNotificationsCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/dashboard/${userId}/notifications/count`).pipe(
      catchError(error => {
        console.error('Error loading notifications count:', error);
        return of(Math.floor(Math.random() * 10));
      })
    );
  }

  refreshDashboardData(userId: number): Observable<DashboardData> {
    return this.http.post<DashboardData>(`${this.API_URL}/dashboard/${userId}/refresh`, {}).pipe(
      catchError(error => {
        console.error('Error refreshing dashboard data:', error);
        return this.getMockDashboardData();
      })
    );
  }

  markNotificationsAsRead(userId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/dashboard/${userId}/notifications/read`, {}).pipe(
      catchError(error => {
        console.error('Error marking notifications as read:', error);
        return of(void 0);
      })
    );
  }

  getUserOnlineStatus(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/users/${userId}/status`).pipe(
      catchError(error => {
        console.error('Error getting user online status:', error);
        return of(Math.random() > 0.1);
      })
    );
  }

  private getMockDashboardData(): Observable<DashboardData> {
    return of({
      stats: {
        profileCompletion: 85,
        securityStatus: '2FA Activé',
        securityClass: 'text-success',
        securityIcon: '✓',
        securityText: 'Sécurisé',
        monthlyConnections: 12,
        lastConnection: "Aujourd'hui",
        unreadNotifications: 3,
        memberSince: 'Janvier 2024',
        lastLogin: "Aujourd'hui à 14:30"
      },
      recentActivities: [
        {
          type: 'success',
          icon: 'fas fa-user-check',
          title: 'Profil mis à jour',
          description: 'Vos informations personnelles ont été mises à jour avec succès',
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
          icon: 'fas fa-shield-alt',
          title: 'Sécurité',
          description: 'Pensez à mettre à jour votre mot de passe',
          time: 'Hier'
        }
      ],
      unreadCount: 5,
      isUserOnline: true
    });
  }

  private getMockDashboardStats(): Observable<DashboardStats> {
    return of({
      profileCompletion: Math.floor(Math.random() * 30) + 70,
      securityStatus: '2FA Activé',
      securityClass: 'text-success',
      securityIcon: '✓',
      securityText: 'Sécurisé',
      monthlyConnections: Math.floor(Math.random() * 20) + 5,
      lastConnection: "Aujourd'hui",
      unreadNotifications: Math.floor(Math.random() * 10),
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
        description: 'Vos informations personnelles ont été mises à jour avec succès',
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
        icon: 'fas fa-shield-alt',
        title: 'Sécurité',
        description: 'Pensez à mettre à jour votre mot de passe',
        time: 'Hier'
      }
    ]);
  }
}

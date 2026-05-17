import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalConnections: number;
  systemHealth: 'good' | 'warning' | 'critical';
  lastBackup: string;
  storageUsed: number;
  storageTotal: number;
  recentActivities: AdminActivity[];
}

export interface AdminActivity {
  id: number;
  type: 'user_registered' | 'user_login' | 'system_backup' | 'security_alert';
  title: string;
  description: string;
  time: string;
  icon: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  registrationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor() {}

  getAdminStats(): Observable<AdminStats> {
    const mockStats: AdminStats = {
      totalUsers: 1247,
      activeUsers: 892,
      newUsersThisMonth: 47,
      totalConnections: 15420,
      systemHealth: 'good',
      lastBackup: '2024-02-09 14:30',
      storageUsed: 67.5,
      storageTotal: 100,
      recentActivities: [
        {
          id: 1,
          type: 'user_registered',
          title: 'Nouvel utilisateur inscrit',
          description: 'john.doe@example.com a créé un compte',
          time: 'Il y a 5 minutes',
          icon: 'fas fa-user-plus',
          severity: 'low'
        },
        {
          id: 2,
          type: 'system_backup',
          title: 'Sauvegarde système',
          description: 'Sauvegarde automatique terminée avec succès',
          time: 'Il y a 2 heures',
          icon: 'fas fa-database',
          severity: 'low'
        },
        {
          id: 3,
          type: 'security_alert',
          title: 'Alerte de sécurité',
          description: 'Tentative de connexion multiple détectée',
          time: 'Il y a 4 heures',
          icon: 'fas fa-exclamation-triangle',
          severity: 'medium'
        },
        {
          id: 4,
          type: 'user_login',
          title: 'Connexion admin',
          description: 'admin@system.com s\'est connecté',
          time: 'Il y a 6 heures',
          icon: 'fas fa-sign-in-alt',
          severity: 'low'
        }
      ]
    };

    return of(mockStats).pipe(delay(1000));
  }

  getUsers(): Observable<AdminUser[]> {
    const mockUsers: AdminUser[] = [
      {
        id: 1,
        email: 'admin@system.com',
        name: 'Administrateur',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-02-09 09:15',
        registrationDate: '2024-01-01'
      },
      {
        id: 2,
        email: 'user1@example.com',
        name: 'Jean Dupont',
        role: 'user',
        status: 'active',
        lastLogin: '2024-02-08 16:30',
        registrationDate: '2024-01-15'
      },
      {
        id: 3,
        email: 'user2@example.com',
        name: 'Marie Martin',
        role: 'user',
        status: 'inactive',
        lastLogin: '2024-02-01 10:20',
        registrationDate: '2024-01-20'
      }
    ];

    return of(mockUsers).pipe(delay(800));
  }

  updateUserStatus(userId: number, status: 'active' | 'inactive' | 'suspended'): Observable<boolean> {
    console.log(`Updating user ${userId} status to ${status}`);
    return of(true).pipe(delay(500));
  }

  deleteUser(userId: number): Observable<boolean> {
    console.log(`Deleting user ${userId}`);
    return of(true).pipe(delay(500));
  }
}

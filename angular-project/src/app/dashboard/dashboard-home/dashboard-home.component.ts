import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { DashboardService, DashboardStats, Activity } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-home">
      <div class="page-header">
        <h1>Tableau de bord</h1>
        <p class="text-muted">Bienvenue sur votre espace personnel</p>
      </div>
      
      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-user"></i>
            </div>
            <div class="stat-content">
              <h3>Profil</h3>
              <p>Complété à {{ profileCompletion }}%</p>
              <div class="progress">
                <div class="progress-bar bg-primary" [style.width.%]="profileCompletion"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="stat-content">
              <h3>Sécurité</h3>
              <p>{{ securityStatus }}</p>
              <small [class]="securityClass">{{ securityIcon }} {{ securityText }}</small>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <h3>Connexions</h3>
              <p>{{ monthlyConnections }} ce mois</p>
              <small class="text-muted">Dernière: {{ lastConnection }}</small>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-bell"></i>
            </div>
            <div class="stat-content">
              <h3>Notifications</h3>
              <p>{{ unreadNotifications }} non lues</p>
              <small class="text-warning" *ngIf="unreadNotifications > 0">⚠ Nouveaux</small>
              <small class="text-success" *ngIf="unreadNotifications === 0">✓ À jour</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="action-card">
            <h4><i class="fas fa-user-edit me-2"></i>Actions rapides</h4>
            <div class="action-buttons">
              <a routerLink="/dashboard/profile" class="btn btn-outline-primary btn-sm" (click)="navigateToProfile()">
                <i class="fas fa-user me-1"></i>Modifier profil
              </a>
              <a routerLink="/dashboard/settings" class="btn btn-outline-secondary btn-sm" (click)="navigateToSettings()">
                <i class="fas fa-cog me-1"></i>Paramètres
              </a>
              <a routerLink="/dashboard/history" class="btn btn-outline-info btn-sm" (click)="navigateToHistory()">
                <i class="fas fa-history me-1"></i>Historique
              </a>
            </div>
          </div>
        </div>
        
        <div class="col-md-6 mb-4">
          <div class="info-card">
            <h4><i class="fas fa-info-circle me-2"></i>Informations</h4>
            <ul class="info-list">
              <li><strong>Email:</strong> john.doe&#64;example.com</li>
              <li><strong>Membre depuis:</strong> {{ memberSince }}</li>
              <li><strong>Dernière connexion:</strong> {{ lastLogin }}</li>
              <li><strong>Statut:</strong> <span class="badge bg-success">Actif</span></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row">
        <div class="col-12 mb-4">
          <div class="activity-card">
            <h4><i class="fas fa-history me-2"></i>Activité récente</h4>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <div class="activity-icon" [class]="activity.type">
                  <i [class]="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <h6>{{ activity.title }}</h6>
                  <p>{{ activity.description }}</p>
                  <small class="text-muted">{{ activity.time }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  profileCompletion = 0;
  securityStatus = '';
  securityClass = '';
  securityIcon = '';
  securityText = '';
  monthlyConnections = 0;
  lastConnection = '';
  unreadNotifications = 0;
  memberSince = '';
  lastLogin = '';

  recentActivities: Activity[] = [];
  
  private userId: number | null = null;

  constructor(
    private userService: UserService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    console.log('Bienvenue sur votre tableau de bord');
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.userId = user.id;
        this.loadDashboardData();
      } else {
        // Utiliser un ID par défaut pour la démo
        this.userId = 1;
        this.loadDashboardData();
      }
    });
  }

  private loadDashboardData(): void {
    if (this.userId) {
      this.dashboardService.getDashboardStats(this.userId).subscribe((stats: DashboardStats) => {
        this.profileCompletion = stats.profileCompletion;
        this.securityStatus = stats.securityStatus;
        this.securityClass = stats.securityClass;
        this.securityIcon = stats.securityIcon;
        this.securityText = stats.securityText;
        this.monthlyConnections = stats.monthlyConnections;
        this.lastConnection = stats.lastConnection;
        this.unreadNotifications = stats.unreadNotifications;
        this.memberSince = stats.memberSince;
        this.lastLogin = stats.lastLogin;
      });

      this.dashboardService.getRecentActivities(this.userId).subscribe((activities: Activity[]) => {
        this.recentActivities = activities;
      });
    }
  }

  navigateToProfile(): void {
    console.log('Redirection vers le profil...');
  }

  navigateToSettings(): void {
    console.log('Redirection vers les paramètres...');
  }

  navigateToHistory(): void {
    console.log('Redirection vers l\'historique...');
  }
}

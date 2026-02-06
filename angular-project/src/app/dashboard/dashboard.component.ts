import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { ThemeToggleComponent } from '../components/theme-toggle/theme-toggle.component';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../services/user.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterOutlet, 
    NavbarComponent, 
    ThemeToggleComponent
  ],
  template: `
    <app-navbar></app-navbar>
    <div class="dashboard-container">
      <app-theme-toggle></app-theme-toggle>
      
      <!-- Sidebar -->
      <div class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <div class="sidebar-content">
          <!-- User Profile Mini -->
          <div class="user-profile-mini">
            <div class="avatar-mini">
              <img [src]="currentUser?.avatar || defaultAvatar" alt="Avatar" class="avatar-img">
              <div class="status-indicator" [class.online]="isUserOnline"></div>
            </div>
            <div class="user-info" [class.hidden]="isSidebarCollapsed">
              <h5>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h5>
              <p>{{ currentUser?.email }}</p>
              <small class="status-text">{{ isUserOnline ? 'En ligne' : 'Hors ligne' }}</small>
            </div>
          </div>
          
          <!-- Navigation -->
          <nav class="sidebar-nav">
            <ul class="nav-list">
              <li class="nav-item">
                <a routerLink="/dashboard" routerLinkActive="active" class="nav-link" 
                   [title]="isSidebarCollapsed ? 'Tableau de bord' : ''">
                  <i class="fas fa-home me-2"></i>
                  <span [class.hidden]="isSidebarCollapsed">Tableau de bord</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/dashboard/profile" routerLinkActive="active" class="nav-link"
                   [title]="isSidebarCollapsed ? 'Profil' : ''">
                  <i class="fas fa-user me-2"></i>
                  <span [class.hidden]="isSidebarCollapsed">Profil</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/dashboard/settings" routerLinkActive="active" class="nav-link"
                   [title]="isSidebarCollapsed ? 'Paramètres' : ''">
                  <i class="fas fa-cog me-2"></i>
                  <span [class.hidden]="isSidebarCollapsed">Paramètres</span>
                </a>
              </li>
              <li class="nav-item">
                <a routerLink="/dashboard/history" routerLinkActive="active" class="nav-link"
                   [title]="isSidebarCollapsed ? 'Historique' : ''">
                  <i class="fas fa-history me-2"></i>
                  <span [class.hidden]="isSidebarCollapsed">Historique</span>
                </a>
              </li>
            </ul>
          </nav>
          
          <!-- Quick Actions -->
          <div class="quick-actions" [class.hidden]="isSidebarCollapsed">
            <h6>Actions rapides</h6>
            <div class="action-buttons">
              <button class="btn btn-outline-primary btn-sm" (click)="refreshData()" title="Actualiser">
                <i class="fas fa-sync-alt me-1"></i>Actualiser
              </button>
              <button class="btn btn-outline-secondary btn-sm" (click)="showNotifications()" title="Notifications">
                <i class="fas fa-bell me-1"></i>Notifications
                <span class="badge bg-danger ms-1" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
              </button>
            </div>
          </div>
          
          <!-- Sidebar Footer -->
          <div class="sidebar-footer">
            <button class="btn btn-outline-danger btn-sm w-100" (click)="logout()" 
                    [title]="isSidebarCollapsed ? 'Déconnexion' : ''">
              <i class="fas fa-sign-out-alt me-2"></i>
              <span [class.hidden]="isSidebarCollapsed">Déconnexion</span>
            </button>
            
            <!-- Toggle Sidebar -->
            <button class="btn btn-outline-secondary btn-sm w-100 mt-2" (click)="toggleSidebar()"
                    [title]="isSidebarCollapsed ? 'Développer' : 'Réduire'">
              <i [class]="isSidebarCollapsed ? 'fas fa-expand-alt' : 'fas fa-compress-alt'"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="main-content" [class.expanded]="isSidebarCollapsed">
        <!-- Breadcrumb -->
        <div class="breadcrumb-container">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/dashboard">
                  <i class="fas fa-home me-1"></i>Accueil
                </a>
              </li>
              <li class="breadcrumb-item active" *ngIf="currentPageTitle">
                {{ currentPageTitle }}
              </li>
            </ol>
          </nav>
          
          <!-- Page Actions -->
          <div class="page-actions">
            <button class="btn btn-outline-primary btn-sm" (click)="refreshData()">
              <i class="fas fa-sync-alt me-1"></i>Actualiser
            </button>
            <button class="btn btn-outline-secondary btn-sm" (click)="toggleFullscreen()">
              <i class="fas fa-expand me-1"></i>Plein écran
            </button>
          </div>
        </div>
        
        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  defaultAvatar = 'https://picsum.photos/seed/default/100/100.jpg';
  isUserOnline = true;
  isSidebarCollapsed = false;
  currentPageTitle = '';
  unreadCount = 5;
  
  private routerSubscription: Subscription | null = null;
  private onlineStatusInterval: any;
  private userId: number | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupRouterListener();
    this.startOnlineStatusMonitoring();
    this.checkUnreadNotifications();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.onlineStatusInterval) {
      clearInterval(this.onlineStatusInterval);
    }
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userId = user.id;
        this.loadDashboardData();
      } else {
        // Utiliser des données par défaut pour la démo
        this.currentUser = {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          avatar: 'https://picsum.photos/seed/user123/100/100.jpg'
        };
        this.userId = 1;
        this.loadDashboardData();
      }
    });
  }

  private setupRouterListener(): void {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });

    // Initialiser le titre de page
    this.updatePageTitle(this.router.url);
  }

  private updatePageTitle(url: string): void {
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/dashboard/profile': 'Profil utilisateur',
      '/dashboard/settings': 'Paramètres',
      '/dashboard/history': 'Historique des connexions'
    };

    this.currentPageTitle = routeMap[url] || 'Page';
  }

  private startOnlineStatusMonitoring(): void {
    if (this.userId) {
      this.dashboardService.getUserOnlineStatus(this.userId).subscribe(isOnline => {
        this.isUserOnline = isOnline;
      });
      
      this.onlineStatusInterval = setInterval(() => {
        this.dashboardService.getUserOnlineStatus(this.userId!).subscribe(isOnline => {
          this.isUserOnline = isOnline;
        });
      }, 30000);
    }
  }

  private loadDashboardData(): void {
    if (this.userId) {
      this.checkUnreadNotifications();
      this.startOnlineStatusMonitoring();
    }
  }

  private checkUnreadNotifications(): void {
    if (this.userId) {
      this.dashboardService.getUnreadNotificationsCount(this.userId).subscribe(count => {
        this.unreadCount = count;
      });
    }
  }

  // Actions utilisateur
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    console.log(
      this.isSidebarCollapsed ? 'Barre latérale réduite' : 'Barre latérale développée'
    );
  }

  refreshData(): void {
    console.log('Actualisation des données...');
    
    if (this.userId) {
      this.dashboardService.refreshDashboardData(this.userId).subscribe(() => {
        this.loadCurrentUser();
        console.log('Données actualisées avec succès');
      });
    } else {
      setTimeout(() => {
        this.loadCurrentUser();
        console.log('Données actualisées avec succès');
      }, 1000);
    }
  }

  showNotifications(): void {
    console.log('Redirection vers les notifications...');
    if (this.userId) {
      this.dashboardService.markNotificationsAsRead(this.userId).subscribe(() => {
        this.unreadCount = 0;
      });
    }
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      console.log('Mode plein écran activé');
    } else {
      document.exitFullscreen();
      console.log('Mode plein écran désactivé');
    }
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      console.log('Déconnexion en cours...');
      
      setTimeout(() => {
        // Nettoyer les données utilisateur
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        
        // Utiliser le service d'authentification
        this.authService.logout();
        
        console.log('Déconnexion réussie');
        
        // Rediriger vers la page de login
        this.router.navigate(['/login']);
      }, 1500);
    }
  }

  // Getters pour le template
  get userName(): string {
    return this.currentUser ? `${this.currentUser.firstName} ${this.currentUser.lastName}` : 'Utilisateur';
  }

  get userEmail(): string {
    return this.currentUser?.email || 'user@example.com';
  }

  get userAvatar(): string {
    return this.currentUser?.avatar || this.defaultAvatar;
  }

  // Méthodes utilitaires
  get currentDateTime(): string {
    return new Date().toLocaleString('fr-FR');
  }

  get lastLoginTime(): string {
    const lastLogin = localStorage.getItem('lastLogin');
    if (lastLogin) {
      return new Date(lastLogin).toLocaleString('fr-FR');
    }
    return 'Première connexion';
  }
}

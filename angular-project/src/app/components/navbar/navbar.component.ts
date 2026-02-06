import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { UserService, User } from '../../services/user.service';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary" [class.scrolled]="isScrolled">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <i class="fas fa-rocket me-2 brand-icon"></i>
          <span class="logo-text">MHBM</span>
        </a>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="isMobileMenuOpen"
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon" [class.active]="isMobileMenuOpen"></span>
        </button>
        
        <div class="navbar-collapse" [class.show]="isMobileMenuOpen">
          <!-- Navigation principale -->
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active">
                <i class="fas fa-home me-1"></i>Accueil
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/features" routerLinkActive="active">
                <i class="fas fa-star me-1"></i>Fonctionnalités
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/about" routerLinkActive="active">
                <i class="fas fa-info-circle me-1"></i>À propos
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/contact" routerLinkActive="active">
                <i class="fas fa-envelope me-1"></i>Contact
              </a>
            </li>
          </ul>
          
          <!-- Section utilisateur -->
          <ul class="navbar-nav">
            <!-- Utilisateur non connecté -->
            <ng-container *ngIf="!currentUser">
              <li class="nav-item">
                <a class="nav-link" routerLink="/login" routerLinkActive="active">
                  <i class="fas fa-sign-in-alt me-1"></i>Connexion
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link btn-nav-signup" routerLink="/register" routerLinkActive="active">
                  <i class="fas fa-user-plus me-1"></i>Inscription
                </a>
              </li>
            </ng-container>
            
            <!-- Utilisateur connecté -->
            <ng-container *ngIf="currentUser">
              <!-- Notifications -->
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" (click)="toggleNotifications($event)">
                  <i class="fas fa-bell position-relative">
                    <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                  </i>
                </a>
                <div class="dropdown-menu dropdown-menu-end notification-dropdown" [class.show]="showNotifications">
                  <div class="notification-header">
                    <h6 class="mb-0">Notifications</h6>
                    <button class="btn btn-sm btn-link" (click)="markAllAsRead()">Tout marquer comme lu</button>
                  </div>
                  <div class="notification-list">
                    <div class="notification-item" *ngFor="let notification of recentNotifications">
                      <div class="notification-icon" [class]="notification.type">
                        <i [class]="notification.icon"></i>
                      </div>
                      <div class="notification-content">
                        <p class="mb-0">{{ notification.title }}</p>
                        <small class="text-muted">{{ notification.time }}</small>
                      </div>
                    </div>
                    <div class="text-center p-3" *ngIf="recentNotifications.length === 0">
                      <small class="text-muted">Aucune notification</small>
                    </div>
                  </div>
                  <div class="notification-footer">
                    <a class="dropdown-item" routerLink="/dashboard/notifications">Voir toutes</a>
                  </div>
                </div>
              </li>
              
              <!-- Menu utilisateur -->
              <li class="nav-item dropdown user-dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" (click)="toggleUserMenu($event)">
                  <img [src]="currentUser.avatar || defaultAvatar" alt="Avatar" class="user-avatar">
                  <span class="user-name ms-2 d-none d-lg-inline">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
                </a>
                <div class="dropdown-menu dropdown-menu-end" [class.show]="showUserMenu">
                  <div class="dropdown-header">
                    <img [src]="currentUser.avatar || defaultAvatar" alt="Avatar" class="user-avatar-large">
                    <div class="user-info">
                      <strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>
                      <small class="text-muted d-block">{{ currentUser.email }}</small>
                    </div>
                  </div>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item" routerLink="/dashboard">
                    <i class="fas fa-tachometer-alt me-2"></i>Tableau de bord
                  </a>
                  <a class="dropdown-item" routerLink="/dashboard/profile">
                    <i class="fas fa-user me-2"></i>Mon profil
                  </a>
                  <a class="dropdown-item" routerLink="/dashboard/settings">
                    <i class="fas fa-cog me-2"></i>Paramètres
                  </a>
                  <div class="dropdown-divider"></div>
                  <a class="dropdown-item text-danger" href="#" (click)="logout($event)">
                    <i class="fas fa-sign-out-alt me-2"></i>Déconnexion
                  </a>
                </div>
              </li>
            </ng-container>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  defaultAvatar = 'https://picsum.photos/seed/default/100/100.jpg';
  isScrolled = false;
  isMobileMenuOpen = false;
  showUserMenu = false;
  showNotifications = false;
  unreadCount = 0;
  recentNotifications: any[] = [];
  
  private routerSubscription: Subscription | null = null;
  private scrollListener: () => void;
  
  constructor(
    private router: Router,
    private userService: UserService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.scrollListener = this.handleScroll.bind(this);
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupRouterListener();
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.scrollListener && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadNotifications();
      }
    });
  }

  private loadNotifications(): void {
    if (this.currentUser) {
      this.dashboardService.getUnreadNotificationsCount(this.currentUser.id).subscribe(count => {
        this.unreadCount = count;
      });
      
      this.dashboardService.getRecentActivities(this.currentUser.id).subscribe(activities => {
        this.recentNotifications = activities.slice(0, 5);
      });
    }
  }

  private setupRouterListener(): void {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeAllDropdowns();
    });
  }

  private setupScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.scrollListener);
    }
  }

  private handleScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled = window.scrollY > 50;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.closeAllDropdowns();
    }
  }

  toggleUserMenu(event: Event): void {
    event.preventDefault();
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications(event: Event): void {
    event.preventDefault();
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  closeAllDropdowns(): void {
    this.showUserMenu = false;
    this.showNotifications = false;
    this.isMobileMenuOpen = false;
  }

  markAllAsRead(): void {
    if (this.currentUser) {
      this.dashboardService.markNotificationsAsRead(this.currentUser.id).subscribe(() => {
        this.unreadCount = 0;
        this.recentNotifications = [];
      });
    }
  }

  logout(event: Event): void {
    event.preventDefault();
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.userService.logout();
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}

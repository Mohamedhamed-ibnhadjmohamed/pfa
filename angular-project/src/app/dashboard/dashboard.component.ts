import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../components/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isSidebarCollapsed = false;
  pageTitle = 'Tableau de bord';
  private routerSubscription: Subscription;
  private scrollListener: any;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.scrollListener = this.handleScroll.bind(this);
    this.routerSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupPageTitle();
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
    });
  }

  private setupPageTitle(): void {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  private updatePageTitle(url: string): void {
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Tableau de bord',
      '/dashboard/profile': 'Profil',
      '/dashboard/settings': 'Paramètres'
    };

    this.pageTitle = routeMap[url] || 'Tableau de bord';
  }

  private setupScrollListener(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.scrollListener);
    }
  }

  private handleScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isSidebarCollapsed = window.scrollY > 50;
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

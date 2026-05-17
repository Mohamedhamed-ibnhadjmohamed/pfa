import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isScrolled = false;
  isMobileMenuOpen = false;
  showUserMenu = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private loadUserData() {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleUserMenu(event: Event) {
    event.preventDefault();
    this.showUserMenu = !this.showUserMenu;
  }

  closeMenus() {
    this.showUserMenu = false;
    this.isMobileMenuOpen = false;
  }

  logout(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

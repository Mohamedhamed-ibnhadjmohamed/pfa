import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../auth/auth.service';
import { AdminService, AdminStats } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard-home.component.html',
  styleUrl: './admin-dashboard-home.component.scss'
})
export class AdminDashboardHomeComponent implements OnInit {
  currentUser: User | null = null;
  adminStats: AdminStats | null = null;
  isLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAdminStats();
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadAdminStats(): void {
    this.isLoading = true;
    this.adminService.getAdminStats().subscribe({
      next: (stats: AdminStats) => {
        this.adminStats = stats;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques admin:', error);
        this.isLoading = false;
      }
    });
  }

  refreshStats(): void {
    this.loadAdminStats();
  }

  logout(): void {
    this.authService.logout();
  }

  getSystemHealthClass(health?: string): string {
    switch (health) {
      case 'good': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getSystemHealthText(health?: string): string {
    switch (health) {
      case 'good': return 'Bonne';
      case 'warning': return 'Attention';
      case 'critical': return 'Critique';
      default: return 'Inconnue';
    }
  }

  getSystemHealthTextClass(health?: string): string {
    switch (health) {
      case 'good': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  getSystemHealthDescription(health?: string): string {
    switch (health) {
      case 'good': return 'Système fonctionnel';
      case 'warning': return 'Surveillance requise';
      case 'critical': return 'Intervention nécessaire';
      default: return 'État inconnu';
    }
  }

  trackById(index: number, activity: any): number {
    return activity.id || index;
  }

  getActiveUserPercentage(): number {
    if (!this.adminStats) return 0;
    return Math.round((this.adminStats.activeUsers / this.adminStats.totalUsers) * 100);
  }
}

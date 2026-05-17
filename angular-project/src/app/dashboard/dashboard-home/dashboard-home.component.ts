import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, User } from '../../services/user.service';
import {  DashboardStats, Activity } from '../../services/dashboard.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  currentUser: User | null = null;
  stats: DashboardStats | null = null;
  activities: Activity[] = [];
  isLoading = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  private loadDashboardData(): void {
    if (this.currentUser && this.currentUser.id) {
      this.isLoading = true;
      

      
  
      
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  trackById(index: number, activity: any): number {
    return activity.id || index;
  }
}

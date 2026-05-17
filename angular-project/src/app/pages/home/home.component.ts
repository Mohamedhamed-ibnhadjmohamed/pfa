import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated$: Observable<boolean>;
  userStats = {
    connections: 0,
    daysActive: 0,
    profileCompletion: 0,
    lastLogin: 'Aujourd\'hui'
  };

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    this.isAuthenticated$ = new Observable<boolean>(subscriber => {
      subscriber.next(!!this.authService.getToken());
    });
  }

  ngOnInit() {
    this.loadUserData();
  }

  private loadUserData() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.calculateUserStats();
    }
  }

  private calculateUserStats() {
    // Simuler des statistiques utilisateur
    this.userStats = {
      connections: Math.floor(Math.random() * 50) + 10,
      daysActive: Math.floor(Math.random() * 30) + 1,
      profileCompletion: Math.floor(Math.random() * 30) + 70,
      lastLogin: 'Aujourd\'hui'
    };
  }
}

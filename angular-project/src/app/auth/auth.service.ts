import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, LoginRequest, RegisterRequest } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  login(email: string, password: string) {
    return this.userService.login({ email, password });
  }

  register(userData: RegisterRequest) {
    return this.userService.register(userData);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('currentUser') !== null;
  }

  getCurrentUser() {
    return this.userService.getCurrentUser();
  }
}

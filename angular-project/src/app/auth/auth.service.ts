import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, LoginRequest, RegisterRequest } from '../services/user.service';
import { StorageUtil } from '../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
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
    if (!isPlatformBrowser(this.platformId)) return false;
    return StorageUtil.getItem('currentUser') !== null;
  }

  getCurrentUser() {
    return this.userService.getCurrentUser();
  }
}

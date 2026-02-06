import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { StorageUtil } from '../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
    this.saveTheme();
  }

  isDark(): boolean {
    return this.isDarkMode;
  }

  private updateTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  private saveTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    StorageUtil.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private loadTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // En SSR, utiliser une valeur par défaut
      this.isDarkMode = false;
      return;
    }
    
    const savedTheme = StorageUtil.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.updateTheme();
  }
}

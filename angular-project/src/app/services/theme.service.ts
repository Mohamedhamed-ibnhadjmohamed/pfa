import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = false;

  constructor() {
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
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  private saveTheme(): void {
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.updateTheme();
  }
}

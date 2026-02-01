import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button 
      class="theme-toggle-btn"
      (click)="toggleTheme()"
      [attr.aria-label]="isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'"
      title="Changer le thème">
      <i [class]="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
  `,
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent implements OnInit {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDark();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDark();
  }
}

import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageUtil } from '../../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit {
  progress = 0;
  currentMessage = 'Initialisation de l\'application...';
  currentTip = '';

  private messages = [
    'Initialisation de l\'application...',
    'Chargement des composants...',
    'Configuration des services...',
    'Vérification des autorisations...',
    'Préparation de l\'interface...',
    'Finalisation...'
  ];

  private tips = [
    'Utilisez Ctrl+K pour accéder rapidement à n\'importe quelle page',
    'Votre profil est accessible depuis le menu utilisateur',
    'Les nouvelles activités apparaissent dans votre dashboard',
    'Vous pouvez personnaliser votre thème dans les paramètres',
    'Pensez à sauvegarder régulièrement votre travail',
    'L\'application fonctionne hors ligne avec certaines limitations'
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startLoading();
    } else {
      // En SSR, rediriger directement après un court délai
      setTimeout(() => {
        this.navigateToNext();
      }, 1000);
    }
  }

  private startLoading(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    let messageIndex = 0;
    let tipIndex = Math.floor(Math.random() * this.tips.length);
    
    this.currentTip = this.tips[tipIndex];

    const loadingInterval = setInterval(() => {
      this.progress += Math.random() * 15 + 5;
      
      if (this.progress >= 100) {
        this.progress = 100;
        this.currentMessage = 'Terminé !';
        clearInterval(loadingInterval);
        
        setTimeout(() => {
          this.navigateToNext();
        }, 1000);
      } else {
        // Update message based on progress
        const newMessageIndex = Math.floor((this.progress / 100) * this.messages.length);
        if (newMessageIndex !== messageIndex && newMessageIndex < this.messages.length) {
          messageIndex = newMessageIndex;
          this.currentMessage = this.messages[messageIndex];
        }
      }
    }, 300);
  }

  private navigateToNext(): void {
    // Navigate based on user's intended destination or default
    let intendedRoute = '/dashboard';
    
    if (isPlatformBrowser(this.platformId)) {
      intendedRoute = StorageUtil.getItem('intendedRoute') || '/dashboard';
      StorageUtil.removeItem('intendedRoute');
    }
    
    this.router.navigate([intendedRoute]);
  }
}

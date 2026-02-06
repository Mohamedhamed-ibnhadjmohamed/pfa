import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageUtil } from '../../utils/storage.util';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <div class="spinner-inner"></div>
        </div>
        <h2 class="loading-title">Chargement en cours...</h2>
        <p class="loading-message">{{ currentMessage }}</p>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progress"></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
        <div class="loading-tips">
          <h4>Astuce :</h4>
          <p>{{ currentTip }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
    }

    .loading-content {
      text-align: center;
      max-width: 400px;
      padding: 2rem;
    }

    .loading-spinner {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
    }

    .spinner {
      width: 100%;
      height: 100%;
      border: 4px solid rgba(255,255,255,0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner-inner {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite reverse;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-title {
      font-size: 1.8rem;
      margin-bottom: 1rem;
      font-weight: 300;
    }

    .loading-message {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      min-height: 1.5rem;
    }

    .loading-progress {
      margin-bottom: 2rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: rgba(255,255,255,0.3);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background-color: white;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .loading-tips {
      background-color: rgba(255,255,255,0.1);
      padding: 1.5rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }

    .loading-tips h4 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
      opacity: 0.9;
    }

    .loading-tips p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .loading-content {
        padding: 1rem;
      }
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        margin-bottom: 1.5rem;
      }
      
      .loading-title {
        font-size: 1.5rem;
      }
      
      .loading-message {
        font-size: 1rem;
      }
    }
  `]
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
    'Les notifications apparaissent en haut à droite de l\'écran',
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

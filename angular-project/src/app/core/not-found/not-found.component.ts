import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1 class="error-title">Page non trouvée</h1>
        <p class="error-message">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div class="error-actions">
          <a routerLink="/dashboard" class="btn btn-primary">
            <i class="fas fa-home me-2"></i>Retour à l'accueil
          </a>
          <a routerLink="/login" class="btn btn-outline-secondary">
            <i class="fas fa-sign-in-alt me-2"></i>Se connecter
          </a>
        </div>
        <div class="error-suggestions">
          <h3>Peut-être cherchiez-vous :</h3>
          <ul>
            <li><a routerLink="/dashboard">Tableau de bord</a></li>
            <li><a routerLink="/dashboard/profile">Mon profil</a></li>
            <li><a routerLink="/dashboard/settings">Paramètres</a></li>
            <li><a routerLink="/dashboard/history">Historique</a></li>
          </ul>
        </div>
      </div>
      <div class="error-illustration">
        <i class="fas fa-search"></i>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: white;
    }

    .not-found-content {
      text-align: center;
      max-width: 600px;
    }

    .error-code {
      font-size: 8rem;
      font-weight: bold;
      line-height: 1;
      margin-bottom: 1rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .error-title {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 300;
    }

    .error-message {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      border: 2px solid transparent;
    }

    .btn-primary {
      background-color: white;
      color: #667eea;
    }

    .btn-primary:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .btn-outline-secondary {
      background-color: transparent;
      color: white;
      border-color: white;
    }

    .btn-outline-secondary:hover {
      background-color: white;
      color: #667eea;
      transform: translateY(-2px);
    }

    .error-suggestions {
      background-color: rgba(255,255,255,0.1);
      padding: 1.5rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }

    .error-suggestions h3 {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .error-suggestions ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .error-suggestions li {
      margin-bottom: 0.5rem;
    }

    .error-suggestions a {
      color: white;
      text-decoration: none;
      opacity: 0.9;
      transition: opacity 0.3s ease;
    }

    .error-suggestions a:hover {
      opacity: 1;
      text-decoration: underline;
    }

    .error-illustration {
      position: absolute;
      top: 2rem;
      right: 2rem;
      font-size: 4rem;
      opacity: 0.1;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @media (max-width: 768px) {
      .error-code {
        font-size: 6rem;
      }
      
      .error-title {
        font-size: 2rem;
      }
      
      .error-message {
        font-size: 1rem;
      }
      
      .error-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 200px;
        justify-content: center;
      }
      
      .error-illustration {
        display: none;
      }
    }
  `]
})
export class NotFoundComponent {}

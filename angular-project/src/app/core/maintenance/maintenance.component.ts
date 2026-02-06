import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="maintenance-container">
      <div class="maintenance-content">
        <div class="maintenance-icon">
          <i class="fas fa-tools"></i>
        </div>
        <h1 class="maintenance-title">Maintenance en cours</h1>
        <p class="maintenance-message">
          Notre application est actuellement en maintenance pour améliorer vos services.
          Nous serons de retour très prochainement !
        </p>
        
        <div class="maintenance-info">
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <div>
              <h4>Durée estimée</h4>
              <p>{{ estimatedDuration }}</p>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar"></i>
            <div>
              <h4>Date de fin</h4>
              <p>{{ endDate }}</p>
            </div>
          </div>
          <div class="info-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <h4>Impact</h4>
              <p>{{ impact }}</p>
            </div>
          </div>
        </div>

        <div class="maintenance-progress">
          <h3>Progression de la maintenance</h3>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progress"></div>
          </div>
          <span class="progress-text">{{ progress }}% complété</span>
        </div>

        <div class="maintenance-actions">
          <button class="btn btn-primary" (click)="refreshPage()">
            <i class="fas fa-sync-alt me-2"></i>Vérifier le statut
          </button>
          <button class="btn btn-outline-secondary" (click)="notifyMe()">
            <i class="fas fa-bell me-2"></i>M'informer
          </button>
        </div>

        <div class="maintenance-updates">
          <h3>Dernières mises à jour</h3>
          <div class="updates-list">
            <div class="update-item" *ngFor="let update of updates">
              <div class="update-time">{{ update.time }}</div>
              <div class="update-message">{{ update.message }}</div>
            </div>
          </div>
        </div>

        <div class="maintenance-contact">
          <p>Questions ? Contactez notre support :</p>
          <div class="contact-info">
            <a href="mailto:support&#64;exemple.com">
              <i class="fas fa-envelope me-2"></i>support&#64;exemple.com
            </a>
            <a href="tel:+33123456789">
              <i class="fas fa-phone me-2"></i>+33 1 23 45 67 89
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .maintenance-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: white;
    }

    .maintenance-content {
      max-width: 800px;
      width: 100%;
      text-align: center;
    }

    .maintenance-icon {
      font-size: 4rem;
      margin-bottom: 2rem;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .maintenance-title {
      font-size: 3rem;
      margin-bottom: 1rem;
      font-weight: 300;
    }

    .maintenance-message {
      font-size: 1.2rem;
      margin-bottom: 3rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .maintenance-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .info-item {
      background-color: rgba(255,255,255,0.1);
      padding: 1.5rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-item i {
      font-size: 1.5rem;
      opacity: 0.8;
    }

    .info-item h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      opacity: 0.9;
    }

    .info-item p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .maintenance-progress {
      background-color: rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      margin-bottom: 3rem;
    }

    .maintenance-progress h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
    }

    .progress-bar {
      width: 100%;
      height: 10px;
      background-color: rgba(255,255,255,0.3);
      border-radius: 5px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 5px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .maintenance-actions {
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
      cursor: pointer;
      background-color: transparent;
      color: white;
    }

    .btn-primary {
      background-color: white;
      color: #f5576c;
    }

    .btn-primary:hover {
      background-color: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }

    .btn-outline-secondary {
      border-color: white;
    }

    .btn-outline-secondary:hover {
      background-color: white;
      color: #f5576c;
      transform: translateY(-2px);
    }

    .maintenance-updates {
      background-color: rgba(255,255,255,0.1);
      padding: 2rem;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      margin-bottom: 3rem;
      text-align: left;
    }

    .maintenance-updates h3 {
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      text-align: center;
    }

    .updates-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .update-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .update-item:last-child {
      border-bottom: none;
    }

    .update-time {
      font-size: 0.8rem;
      opacity: 0.7;
      min-width: 80px;
    }

    .update-message {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .maintenance-contact {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .maintenance-contact p {
      margin-bottom: 1rem;
    }

    .contact-info {
      display: flex;
      gap: 2rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .contact-info a {
      color: white;
      text-decoration: none;
      opacity: 0.9;
      transition: opacity 0.3s ease;
    }

    .contact-info a:hover {
      opacity: 1;
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .maintenance-title {
        font-size: 2rem;
      }
      
      .maintenance-message {
        font-size: 1rem;
      }
      
      .maintenance-info {
        grid-template-columns: 1fr;
      }
      
      .maintenance-actions {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 200px;
        justify-content: center;
      }
      
      .contact-info {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class MaintenanceComponent implements OnInit {
  progress = 65;
  estimatedDuration = 'Environ 2 heures';
  endDate = 'Aujourd\'hui à 18:00';
  impact = 'Application temporairement indisponible';

  updates = [
    { time: '15:45', message: 'Début de la maintenance planifiée' },
    { time: '15:50', message: 'Sauvegarde des données en cours' },
    { time: '16:15', message: 'Mise à jour des serveurs terminée' },
    { time: '16:30', message: 'Tests de validation en cours' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.simulateProgress();
  }

  private simulateProgress(): void {
    setInterval(() => {
      if (this.progress < 95) {
        this.progress += Math.random() * 2;
      }
    }, 5000);
  }

  refreshPage(): void {
    window.location.reload();
  }

  notifyMe(): void {
    alert('Vous serez notifié dès que la maintenance sera terminée. Dans une vraie application, cela enregistrerait votre email.');
  }
}

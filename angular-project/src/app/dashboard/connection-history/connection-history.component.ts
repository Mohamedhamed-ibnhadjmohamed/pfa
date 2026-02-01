import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-connection-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="connection-history">
      <div class="page-header">
        <h1>Historique des connexions</h1>
        <p class="text-muted">Consultez l'historique de vos connexions et sessions</p>
      </div>
      
      <!-- Statistics -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-sign-in-alt"></i>
            </div>
            <div class="stat-content">
              <h3>{{ totalConnections }}</h3>
              <p>Total connexions</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <h3>{{ thisMonthConnections }}</h3>
              <p>Ce mois</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-desktop"></i>
            </div>
            <div class="stat-content">
              <h3>{{ uniqueDevices }}</h3>
              <p>Appareils uniques</p>
            </div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-globe"></i>
            </div>
            <div class="stat-content">
              <h3>{{ uniqueLocations }}</h3>
              <p>Localisations</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="filters-section mb-4">
        <div class="row">
          <div class="col-md-4">
            <label for="dateFilter" class="form-label">Période</label>
            <select class="form-select" id="dateFilter" [(ngModel)]="selectedPeriod" (change)="applyFilters()">
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
              <option value="365">Dernière année</option>
              <option value="all">Toute la période</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="deviceFilter" class="form-label">Appareil</label>
            <select class="form-select" id="deviceFilter" [(ngModel)]="selectedDevice" (change)="applyFilters()">
              <option value="all">Tous les appareils</option>
              <option value="desktop">Ordinateur</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablette</option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="statusFilter" class="form-label">Statut</label>
            <select class="form-select" id="statusFilter" [(ngModel)]="selectedStatus" (change)="applyFilters()">
              <option value="all">Tous</option>
              <option value="success">Réussi</option>
              <option value="failed">Échoué</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Connection History Table -->
      <div class="history-table">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Date et heure</th>
                <th>Appareil</th>
                <th>Localisation</th>
                <th>Adresse IP</th>
                <th>Navigateur</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let connection of filteredConnections">
                <td>
                  <div class="date-info">
                    <strong>{{ connection.date | date:'dd/MM/yyyy' }}</strong>
                    <small class="text-muted">{{ connection.date | date:'HH:mm:ss' }}</small>
                  </div>
                </td>
                <td>
                  <div class="device-info">
                    <i [class]="getDeviceIcon(connection.device)" class="me-2"></i>
                    {{ getDeviceName(connection.device) }}
                  </div>
                </td>
                <td>
                  <div class="location-info">
                    <i class="fas fa-map-marker-alt me-2"></i>
                    {{ connection.location }}
                  </div>
                </td>
                <td>
                  <code>{{ connection.ipAddress }}</code>
                </td>
                <td>
                  <div class="browser-info">
                    <i [class]="getBrowserIcon(connection.browser)" class="me-2"></i>
                    {{ connection.browser }}
                  </div>
                </td>
                <td>
                  <span class="badge" [class]="getStatusClass(connection.status)">
                    {{ getStatusText(connection.status) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" title="Détails" (click)="showDetails(connection)">
                      <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Révoquer" *ngIf="connection.status === 'success'" (click)="revokeConnection(connection)">
                      <i class="fas fa-ban"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="pagination-section mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" [class.disabled]="currentPage === 1">
              <a class="page-link" href="#" (click)="changePage(currentPage - 1)">Précédent</a>
            </li>
            <li class="page-item" *ngFor="let page of getPagesArray()" [class.active]="page === currentPage">
              <a class="page-link" href="#" (click)="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" [class.disabled]="currentPage === totalPages">
              <a class="page-link" href="#" (click)="changePage(currentPage + 1)">Suivant</a>
            </li>
          </ul>
        </nav>
      </div>
      
      <!-- Active Sessions -->
      <div class="active-sessions mt-5">
        <h3><i class="fas fa-laptop me-2"></i>Sessions actives</h3>
        <div class="row">
          <div class="col-md-6 mb-3" *ngFor="let session of activeSessions">
            <div class="session-card">
              <div class="session-header">
                <div class="session-device">
                  <i [class]="getDeviceIcon(session.device)" class="me-2"></i>
                  <span>{{ getDeviceName(session.device) }}</span>
                </div>
                <span class="badge bg-success">Active</span>
              </div>
              <div class="session-details">
                <p><strong>Dernière activité:</strong> {{ session.lastActivity | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>IP:</strong> {{ session.ipAddress }}</p>
                <p><strong>Localisation:</strong> {{ session.location }}</p>
              </div>
              <div class="session-actions">
                <button class="btn btn-sm btn-outline-warning" (click)="terminateSession(session)">
                  <i class="fas fa-pause me-1"></i>Terminer
                </button>
                <button class="btn btn-sm btn-outline-danger" (click)="revokeSession(session)">
                  <i class="fas fa-ban me-1"></i>Révoquer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './connection-history.component.scss'
})
export class ConnectionHistoryComponent implements OnInit {
  totalConnections = 156;
  thisMonthConnections = 23;
  uniqueDevices = 4;
  uniqueLocations = 3;
  
  selectedPeriod = '30';
  selectedDevice = 'all';
  selectedStatus = 'all';
  currentPage = 1;
  totalPages = 8;
  
  connections = [
    {
      id: 1,
      date: new Date('2024-01-15T14:30:00'),
      device: 'desktop',
      location: 'Paris, France',
      ipAddress: '192.168.1.1',
      browser: 'Chrome 120',
      status: 'success'
    },
    {
      id: 2,
      date: new Date('2024-01-15T09:15:00'),
      device: 'mobile',
      location: 'Lyon, France',
      ipAddress: '192.168.1.2',
      browser: 'Safari 17',
      status: 'success'
    },
    {
      id: 3,
      date: new Date('2024-01-14T18:45:00'),
      device: 'desktop',
      location: 'Marseille, France',
      ipAddress: '192.168.1.3',
      browser: 'Firefox 121',
      status: 'failed'
    },
    {
      id: 4,
      date: new Date('2024-01-14T12:20:00'),
      device: 'tablet',
      location: 'Paris, France',
      ipAddress: '192.168.1.1',
      browser: 'Chrome 120',
      status: 'success'
    },
    {
      id: 5,
      date: new Date('2024-01-13T16:10:00'),
      device: 'mobile',
      location: 'Lyon, France',
      ipAddress: '192.168.1.2',
      browser: 'Chrome 120',
      status: 'success'
    }
  ];
  
  activeSessions = [
    {
      id: 1,
      device: 'desktop',
      ipAddress: '192.168.1.1',
      location: 'Paris, France',
      lastActivity: new Date('2024-01-15T14:30:00')
    },
    {
      id: 2,
      device: 'mobile',
      ipAddress: '192.168.1.2',
      location: 'Lyon, France',
      lastActivity: new Date('2024-01-15T09:15:00')
    }
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadConnectionHistory();
  }

  private loadConnectionHistory(): void {
    this.notificationService.showInfo('Chargement de l\'historique des connexions...', 'Historique');
    // Simuler le chargement des données
    setTimeout(() => {
      this.notificationService.showSuccess('Historique chargé avec succès', 'Succès');
    }, 1000);
  }

  get filteredConnections() {
    return this.connections;
  }

  applyFilters(): void {
    this.notificationService.showInfo('Application des filtres...', 'Filtres');
    // Logique de filtrage à implémenter
  }
  
  getDeviceIcon(device: string): string {
    const icons = {
      desktop: 'fas fa-desktop',
      mobile: 'fas fa-mobile-alt',
      tablet: 'fas fa-tablet-alt'
    };
    return icons[device as keyof typeof icons] || 'fas fa-question';
  }
  
  getDeviceName(device: string): string {
    const names = {
      desktop: 'Ordinateur',
      mobile: 'Mobile',
      tablet: 'Tablette'
    };
    return names[device as keyof typeof names] || 'Inconnu';
  }
  
  getBrowserIcon(browser: string): string {
    if (browser.includes('Chrome')) return 'fab fa-chrome';
    if (browser.includes('Firefox')) return 'fab fa-firefox';
    if (browser.includes('Safari')) return 'fab fa-safari';
    return 'fas fa-globe';
  }
  
  getStatusClass(status: string): string {
    const classes = {
      success: 'bg-success',
      failed: 'bg-danger'
    };
    return classes[status as keyof typeof classes] || 'bg-secondary';
  }
  
  getStatusText(status: string): string {
    const texts = {
      success: 'Réussi',
      failed: 'Échoué'
    };
    return texts[status as keyof typeof texts] || 'Inconnu';
  }

  showDetails(connection: any): void {
    this.notificationService.showInfo(`Détails de la connexion du ${connection.date.toLocaleDateString()}`, 'Détails');
  }

  revokeConnection(connection: any): void {
    if (confirm(`Révoquer la connexion du ${connection.date.toLocaleDateString()} ?`)) {
      this.notificationService.showWarning('Connexion révoquée', 'Sécurité');
    }
  }
  
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.notificationService.showInfo(`Navigation vers la page ${page}`, 'Pagination');
    }
  }

  terminateSession(session: any): void {
    if (confirm(`Terminer la session active sur ${this.getDeviceName(session.device)} ?`)) {
      this.notificationService.showWarning('Session terminée', 'Session');
    }
  }

  revokeSession(session: any): void {
    if (confirm(`Révoquer la session active sur ${this.getDeviceName(session.device)} ?`)) {
      this.notificationService.showError('Session révoquée', 'Sécurité');
    }
  }
  
  getPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}

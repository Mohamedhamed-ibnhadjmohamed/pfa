import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private isUnderMaintenance = false;
  private maintenanceEndTime: Date | null = null;

  constructor(private router: Router) {
    this.checkMaintenanceStatus();
  }

  private checkMaintenanceStatus(): void {
    // Simuler une vérification de maintenance
    // Dans une vraie application, ceci viendrait d'une API
    const maintenanceStart = new Date('2024-01-15T16:00:00');
    const maintenanceEnd = new Date('2024-01-15T18:00:00');
    const now = new Date();

    // Pour démo, vous pouvez changer cette valeur
    this.isUnderMaintenance = false; // Mettre à true pour tester

    if (this.isUnderMaintenance) {
      this.maintenanceEndTime = maintenanceEnd;
      this.redirectToMaintenance();
    }
  }

  private redirectToMaintenance(): void {
    const currentUrl = this.router.url;
    if (currentUrl !== '/maintenance' && currentUrl !== '/404') {
      localStorage.setItem('intendedRoute', currentUrl);
      this.router.navigate(['/maintenance']);
    }
  }

  public checkMaintenance(): boolean {
    if (this.isUnderMaintenance) {
      this.redirectToMaintenance();
      return true;
    }
    return false;
  }

  public getMaintenanceStatus(): {
    isUnderMaintenance: boolean;
    endTime?: Date;
    message: string;
  } {
    if (this.isUnderMaintenance && this.maintenanceEndTime) {
      return {
        isUnderMaintenance: true,
        endTime: this.maintenanceEndTime,
        message: `Maintenance en cours jusqu'à ${this.maintenanceEndTime.toLocaleTimeString()}`
      };
    }

    return {
      isUnderMaintenance: false,
      message: 'Application fonctionnelle'
    };
  }

  public enableMaintenance(durationMinutes: number = 120): void {
    this.isUnderMaintenance = true;
    this.maintenanceEndTime = new Date(Date.now() + durationMinutes * 60 * 1000);
    this.redirectToMaintenance();
  }

  public disableMaintenance(): void {
    this.isUnderMaintenance = false;
    this.maintenanceEndTime = null;
  }
}

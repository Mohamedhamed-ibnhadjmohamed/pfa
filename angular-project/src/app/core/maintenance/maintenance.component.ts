import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss'
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

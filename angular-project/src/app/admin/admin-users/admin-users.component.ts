import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminUser } from '../../services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  isLoading = false;
  selectedUser: AdminUser | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (users: AdminUser[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.isLoading = false;
      }
    });
  }

  updateUserStatus(userId: number, status: 'active' | 'inactive' | 'suspended'): void {
    this.adminService.updateUserStatus(userId, status).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.loadUsers(); // Recharger la liste
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: (success: boolean) => {
          if (success) {
            this.loadUsers(); // Recharger la liste
          }
        },
        error: (error: any) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  selectUser(user: AdminUser): void {
    this.selectedUser = this.selectedUser?.id === user.id ? null : user;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'suspended': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      default: return 'Inconnu';
    }
  }

  trackById(index: number, user: AdminUser): number {
    return user.id;
  }
}

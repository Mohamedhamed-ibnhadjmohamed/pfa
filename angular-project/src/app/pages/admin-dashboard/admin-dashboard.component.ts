import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavbarComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  isLoading = false;
  isEditing = false;
  isCreating = false;
  selectedUser: User | null = null;
  userForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: [''],
      role: ['user', Validators.required]
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/profile']);
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        console.error('Load users error:', error);
      }
    });
  }

  createUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const userData = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: (response: {message: string, user: User}) => {
        this.users.push(response.user);
        this.cancelForm();
        this.successMessage = 'Utilisateur créé avec succès!';
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erreur lors de la création de l\'utilisateur';
        this.isLoading = false;
        console.error('Create user error:', error);
      }
    });
  }

  updateUser() {
    if (this.userForm.invalid || !this.selectedUser) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const userData = this.userForm.value;

    if (this.selectedUser.id) {
      this.userService.updateUser(this.selectedUser.id, userData).subscribe({
        next: (response: {message: string, user: User}) => {
          const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
          if (index !== -1) {
            this.users[index] = response.user;
          }
          this.cancelForm();
          this.successMessage = 'Utilisateur mis à jour avec succès!';
          this.isLoading = false;
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur lors de la mise à jour de l\'utilisateur';
          this.isLoading = false;
          console.error('Update user error:', error);
        }
      });
    }
  }

  deleteUser(userId: number | undefined) {
    if (!userId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.successMessage = 'Utilisateur supprimé avec succès!';
        },
        error: (error: any) => {
          this.errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
          console.error('Delete user error:', error);
        }
      });
    }
  }

  editUser(user: User) {
    this.selectedUser = user;
    this.isEditing = true;
    this.isCreating = false;
    this.successMessage = '';
    this.errorMessage = '';

    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '' // Ne pas pré-remplir le mot de passe
    });

    // Rendre le mot de passe optionnel en mode édition
    this.userForm.get('password')?.removeValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  createNewUser() {
    this.selectedUser = null;
    this.isCreating = true;
    this.isEditing = false;
    this.successMessage = '';
    this.errorMessage = '';

    this.userForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      role: 'user'
    });

    // Rendre le mot de passe obligatoire en mode création
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelForm() {
    this.isEditing = false;
    this.isCreating = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleDisplayName(role: string): string {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'moderator': 'Modérateur',
      'user': 'Utilisateur',
      'guest': 'Invité'
    };
    return roleMap[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    const classMap: { [key: string]: string } = {
      'admin': 'bg-danger',
      'moderator': 'bg-warning',
      'user': 'bg-info',
      'guest': 'bg-secondary'
    };
    return classMap[role] || 'bg-secondary';
  }

  trackByUserId(index: number, user: User): number {
    return user.id || index;
  }

  getUserCountByRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }
}

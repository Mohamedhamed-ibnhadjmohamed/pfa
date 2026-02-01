import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsUrl = 'assets/data/notifications.json';
  private notifications: Notification[] = [];

  constructor(private http: HttpClient) {
    this.loadNotifications();
  }

  // Load notifications from JSON file
  private loadNotifications(): void {
    this.http.get<Notification[]>(this.notificationsUrl).pipe(
      catchError(error => {
        console.warn('Could not load notifications from JSON, using empty array:', error);
        return of([]);
      })
    ).subscribe(data => {
      this.notifications = data.map(n => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    });
  }

  // Save notifications to JSON file (simulation - in real app, this would be a backend call)
  private saveNotifications(): void {
    console.log('Saving notifications to JSON:', this.notifications);
    // In a real application, this would be an HTTP POST/PUT request
    // For now, we just log it since we can't write to JSON files directly from browser
  }

  // Success notifications
  showSuccess(message: string, title?: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'success',
      title: title || 'Succès',
      message,
      timestamp: new Date(),
      read: false
    };
    this.addNotification(notification);
    console.log(`✅ SUCCESS: ${title || 'Succès'} - ${message}`);
  }

  showProfileUpdated(): void {
    this.showSuccess('Profil mis à jour avec succès', 'Profil');
  }

  showSettingsSaved(): void {
    this.showSuccess('Paramètres enregistrés avec succès', 'Paramètres');
  }

  showAvatarUploaded(): void {
    this.showSuccess('Avatar téléchargé avec succès', 'Avatar');
  }

  showLoginSuccess(): void {
    this.showSuccess('Connexion réussie', 'Bienvenue !');
  }

  showRegisterSuccess(): void {
    this.showSuccess('Inscription réussie', 'Compte créé');
  }

  showLogoutSuccess(): void {
    this.showSuccess('Déconnexion réussie', 'Au revoir !');
  }

  // Error notifications
  showError(message: string, title?: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'error',
      title: title || 'Erreur',
      message,
      timestamp: new Date(),
      read: false
    };
    this.addNotification(notification);
    console.log(`❌ ERROR: ${title || 'Erreur'} - ${message}`);
  }

  showLoginError(error?: string): void {
    this.showError(error || 'Email ou mot de passe incorrect', 'Erreur de connexion');
  }

  showRegisterError(error?: string): void {
    this.showError(error || 'Erreur lors de l\'inscription', 'Erreur d\'inscription');
  }

  showProfileError(error?: string): void {
    this.showError(error || 'Erreur lors de la mise à jour du profil', 'Erreur');
  }

  showSettingsError(error?: string): void {
    this.showError(error || 'Erreur lors de la sauvegarde des paramètres', 'Erreur');
  }

  showAvatarError(error?: string): void {
    this.showError(error || 'Erreur lors du téléchargement de l\'avatar', 'Erreur');
  }

  showNetworkError(): void {
    this.showError('Erreur de connexion. Veuillez vérifier votre connexion internet.', 'Erreur réseau');
  }

  // Warning notifications
  showWarning(message: string, title?: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'warning',
      title: title || 'Attention',
      message,
      timestamp: new Date(),
      read: false
    };
    this.addNotification(notification);
    console.log(`⚠️ WARNING: ${title || 'Attention'} - ${message}`);
  }

  showUnsavedChanges(): void {
    this.showWarning('Vous avez des modifications non enregistrées', 'Attention');
  }

  showWeakPassword(): void {
    this.showWarning('Le mot de passe est trop faible', 'Sécurité');
  }

  // Info notifications
  showInfo(message: string, title?: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'info',
      title: title || 'Information',
      message,
      timestamp: new Date(),
      read: false
    };
    this.addNotification(notification);
    console.log(`ℹ️ INFO: ${title || 'Information'} - ${message}`);
  }

  showLoading(message?: string): void {
    this.showInfo(message || 'Chargement en cours...', 'Chargement');
  }

  showSessionExpired(): void {
    this.showInfo('Votre session a expiré. Veuillez vous reconnecter.', 'Session expirée');
  }

  // Custom notifications
  showCustom(message: string, title: string, type: 'success' | 'error' | 'warning' | 'info', options?: any): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      ...options
    };
    this.addNotification(notification);
  }

  // Get all notifications
  getNotifications(): Observable<Notification[]> {
    return of(this.notifications);
  }

  // Get unread notifications
  getUnreadNotifications(): Observable<Notification[]> {
    return of(this.notifications.filter(n => !n.read));
  }

  // Get notifications count
  getUnreadCount(): Observable<number> {
    return of(this.notifications.filter(n => !n.read).length);
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  // Clear all notifications
  clear(): void {
    this.notifications = [];
    this.saveNotifications();
    console.log('🧹 Clearing all notifications');
  }

  // Remove specific notification (alias for deleteNotification)
  remove(notificationId: string): void {
    this.deleteNotification(notificationId);
    console.log(`🗑️ Removing notification with ID: ${notificationId}`);
  }

  // Private helper methods
  private addNotification(notification: Notification): void {
    this.notifications.unshift(notification); // Add to beginning
    this.saveNotifications();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

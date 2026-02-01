import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { UserProfileComponent } from './dashboard/user-profile/user-profile.component';
import { AccountSettingsComponent } from './dashboard/account-settings/account-settings.component';
import { ConnectionHistoryComponent } from './dashboard/connection-history/connection-history.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoadingComponent } from './core/loading/loading.component';
import { MaintenanceComponent } from './core/maintenance/maintenance.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'loading', component: LoadingComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'settings', component: AccountSettingsComponent },
      { path: 'history', component: ConnectionHistoryComponent }
    ]
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

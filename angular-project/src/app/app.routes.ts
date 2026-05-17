import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { UserProfileComponent } from './dashboard/user-profile/user-profile.component';
import { AccountSettingsComponent } from './dashboard/account-settings/account-settings.component';
import { AdminDashboardHomeComponent } from './admin/admin-dashboard-home/admin-dashboard-home.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoadingComponent } from './core/loading/loading.component';
import { MaintenanceComponent } from './core/maintenance/maintenance.component';
import { HomeComponent } from './pages/home/home.component';
import { FeaturesComponent } from './pages/features/features.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'features', component: FeaturesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'loading', component: LoadingComponent },
  { path: 'maintenance', component: MaintenanceComponent },
  
  // Dashboard utilisateur normal
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'settings', component: AccountSettingsComponent }
    ]
  },
  
  // Dashboard admin
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardHomeComponent,
        data: { role: 'admin' }
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        data: { role: 'admin' }
      }
    ]
  },
  
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

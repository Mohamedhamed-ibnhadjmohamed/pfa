import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="container">
          <div class="row align-items-center min-vh-100">
            <div class="col-lg-6">
              <div class="hero-content">
                <h1 class="display-4 fw-bold mb-4">
                  Bienvenue sur <span class="brand-text">MHBM</span>
                </h1>
                <p class="lead mb-4">
                  La plateforme moderne pour gérer votre profil, suivre vos activités et rester connecté avec votre communauté.
                </p>
                <div class="hero-buttons">
                  <a routerLink="/register" class="btn btn-primary btn-lg me-3">
                    <i class="fas fa-rocket me-2"></i>Commencer
                  </a>
                  <a routerLink="/features" class="btn btn-outline-light btn-lg">
                    <i class="fas fa-star me-2"></i>Découvrir
                  </a>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="hero-image">
                <div class="floating-card">
                  <i class="fas fa-chart-line"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Preview -->
      <section class="features-preview py-5">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2 class="display-5 fw-bold mb-3">Pourquoi nous choisir ?</h2>
              <p class="lead text-muted">Découvrez nos fonctionnalités principales</p>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="feature-card text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="fas fa-shield-alt"></i>
                </div>
                <h4>Sécurité</h4>
                <p class="text-muted">Protection avancée de vos données avec authentification à deux facteurs.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="fas fa-tachometer-alt"></i>
                </div>
                <h4>Tableau de bord</h4>
                <p class="text-muted">Interface intuitive pour suivre toutes vos activités en temps réel.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="feature-card text-center p-4">
                <div class="feature-icon mb-3">
                  <i class="fas fa-mobile-alt"></i>
                </div>
                <h4>Responsive</h4>
                <p class="text-muted">Accédez à votre compte depuis n'importe quel appareil.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta py-5">
        <div class="container text-center">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h2 class="display-5 fw-bold mb-4">Prêt à commencer ?</h2>
              <p class="lead mb-4">
                Rejoignez-nous dès maintenant et découvrez une nouvelle façon de gérer votre profil.
              </p>
              <div class="cta-buttons">
                <a routerLink="/register" class="btn btn-primary btn-lg me-3">
                  <i class="fas fa-user-plus me-2"></i>S'inscrire
                </a>
                <a routerLink="/login" class="btn btn-outline-primary btn-lg">
                  <i class="fas fa-sign-in-alt me-2"></i>Se connecter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrl: './home.component.scss'
})
export class HomeComponent {}

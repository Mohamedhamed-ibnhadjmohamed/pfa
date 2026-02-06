import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="features-page">
      <!-- Header -->
      <section class="page-header">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold mb-4">Nos Fonctionnalités</h1>
              <p class="lead text-muted">
                Découvrez toutes les fonctionnalités qui font de MHBM la plateforme idéale pour gérer votre profil.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Features -->
      <section class="main-features py-5">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-6">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-user-shield"></i>
                </div>
                <div class="feature-content">
                  <h3>Profil Sécurisé</h3>
                  <p>
                    Protégez vos données personnelles avec notre système de sécurité avancé incluant 
                    l'authentification à deux facteurs et le chiffrement de bout en bout.
                  </p>
                  <ul class="feature-list">
                    <li><i class="fas fa-check text-success"></i>Authentification 2FA</li>
                    <li><i class="fas fa-check text-success"></i>Chiffrement des données</li>
                    <li><i class="fas fa-check text-success"></i>Connexions sécurisées</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="feature-content">
                  <h3>Tableau de Bord Intelligent</h3>
                  <p>
                    Suivez vos activités en temps réel avec un tableau de bord personnalisable 
                    et des statistiques détaillées sur votre utilisation.
                  </p>
                  <ul class="feature-list">
                    <li><i class="fas fa-check text-success"></i>Statistiques en temps réel</li>
                    <li><i class="fas fa-check text-success"></i>Graphiques interactifs</li>
                    <li><i class="fas fa-check text-success"></i>Rapports personnalisés</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-bell"></i>
                </div>
                <div class="feature-content">
                  <h3>Notifications Intelligentes</h3>
                  <p>
                    Restez informé avec notre système de notifications intelligent qui vous alerte 
                    sur les activités importantes et les mises à jour.
                  </p>
                  <ul class="feature-list">
                    <li><i class="fas fa-check text-success"></i>Notifications en temps réel</li>
                    <li><i class="fas fa-check text-success"></i>Personnalisation des alertes</li>
                    <li><i class="fas fa-check text-success"></i>Centre de notification</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="feature-item">
                <div class="feature-icon">
                  <i class="fas fa-mobile-alt"></i>
                </div>
                <div class="feature-content">
                  <h3>Design Responsive</h3>
                  <p>
                    Accédez à votre compte depuis n'importe quel appareil avec une interface 
                    optimisée pour mobile, tablette et desktop.
                  </p>
                  <ul class="feature-list">
                    <li><i class="fas fa-check text-success"></i>Application mobile native</li>
                    <li><i class="fas fa-check text-success"></i>Site web responsive</li>
                    <li><i class="fas fa-check text-success"></i>Synchronisation automatique</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Additional Features -->
      <section class="additional-features py-5 bg-light">
        <div class="container">
          <div class="row text-center mb-5">
            <div class="col-12">
              <h2 class="display-5 fw-bold mb-3">Et bien plus encore...</h2>
              <p class="lead text-muted">Des fonctionnalités supplémentaires pour une expérience complète</p>
            </div>
          </div>
          <div class="row g-4">
            <div class="col-md-3 col-6">
              <div class="mini-feature">
                <i class="fas fa-history"></i>
                <h5>Historique</h5>
                <p>Consultez l'historique complet de vos connexions et activités</p>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="mini-feature">
                <i class="fas fa-cog"></i>
                <h5>Paramètres</h5>
                <p>Personnalisez votre expérience selon vos préférences</p>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="mini-feature">
                <i class="fas fa-palette"></i>
                <h5>Thèmes</h5>
                <p>Choisissez entre le mode clair et sombre</p>
              </div>
            </div>
            <div class="col-md-3 col-6">
              <div class="mini-feature">
                <i class="fas fa-language"></i>
                <h5>Multilingue</h5>
                <p>Support de plusieurs langues internationales</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section py-5">
        <div class="container text-center">
          <h2 class="display-5 fw-bold mb-4">Prêt à essayer ?</h2>
          <p class="lead mb-4">
            Rejoignez des milliers d'utilisateurs qui font déjà confiance à MHBM
          </p>
          <div class="cta-buttons">
            <a routerLink="/register" class="btn btn-primary btn-lg me-3">
              <i class="fas fa-rocket me-2"></i>Commencer gratuitement
            </a>
            <a routerLink="/contact" class="btn btn-outline-primary btn-lg">
              <i class="fas fa-envelope me-2"></i>Nous contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {}

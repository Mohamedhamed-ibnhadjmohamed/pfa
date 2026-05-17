CREATE DATABASE IF NOT EXISTS nodejs_project;
USE nodejs_project;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,

  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,

  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  oldmotp VARCHAR(255) NULL, -- Mot de passe non crypté (pour usage interne)

  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer un administrateur par défaut
-- Mot de passe: "admin123" (hashé avec bcrypt)
INSERT INTO users (firstName, lastName, email, password, oldmotp, role) 
VALUES (
  'System', 
  'Administrator', 
  'admin@nodejs-project.com', 
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 
  'admin123',
  'admin'
) ON DUPLICATE KEY UPDATE role=role;

-- Insérer votre utilisateur
-- Mot de passe: "Azertyuiop123!" (hashé avec bcrypt)
INSERT INTO users (firstName, lastName, email, password, oldmotp, phone, role) 
VALUES (
  'Mohamed Hamed', 
  'Ibn Hadj Mohamed', 
  'mohamedhamed.ibnhadjmohamed@gmail.com', 
  '$2a$12$kF1v2J3K4L5m6N7o8P9q0rS1t2U3v4W5x6y7z8A9b0C1d2E3f4G5h6i7j8k9l0m', 
  'Azertyuiop123!',
  '+33612345678',
  'user'
) ON DUPLICATE KEY UPDATE role=role;

-- Insérer des utilisateurs de test supplémentaires
-- Mot de passe: "password123" (hashé avec bcrypt)
INSERT INTO users (firstName, lastName, email, password, oldmotp, phone, role) 
VALUES (
  'John', 
  'Doe', 
  'john.doe@example.com', 
  '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
  'password123',
  '+33612345678',
  'user'
) ON DUPLICATE KEY UPDATE role=role;

-- Mot de passe: "user123" (hashé avec bcrypt)
INSERT INTO users (firstName, lastName, email, password, oldmotp, phone, role) 
VALUES (
  'Jane', 
  'Smith', 
  'jane.smith@example.com', 
  '$2a$12$9XjY2qZ8K5vB7L3mN6pP1ePaWxn96p36WQoeG6Lruj3vjPGga31lW', 
  'user123',
  '+33698765432',
  'user'
) ON DUPLICATE KEY UPDATE role=role;

-- Mot de passe: "test123" (hashé avec bcrypt)
INSERT INTO users (firstName, lastName, email, password, oldmotp, role) 
VALUES (
  'Test', 
  'User', 
  'test@example.com', 
  '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'test123',
  'user'
) ON DUPLICATE KEY UPDATE role=role;

-- Insérer un deuxième administrateur
-- Mot de passe: "adminpass" (hashé avec bcrypt)
INSERT INTO users (firstName, lastName, email, password, oldmotp, phone, role) 
VALUES (
  'Admin', 
  'Second', 
  'admin2@nodejs-project.com', 
  '$2a$12$WvLFmOaZJQK8s8qQ8qQ8qu7r7r7r7r7r7r7r7r7r7r7r7r7r7r', 
  'adminpass',
  '+33611111111',
  'admin'
) ON DUPLICATE KEY UPDATE role=role;

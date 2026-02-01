CREATE DATABASE IF NOT EXISTS nodejs_project;
USE nodejs_project;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  location VARCHAR(255),
  website VARCHAR(255),
  birth_date DATE,
  gender ENUM('Homme', 'Femme', 'Autre'),
  language VARCHAR(50) DEFAULT 'Français',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  private_session BOOLEAN DEFAULT FALSE,
  public_profile BOOLEAN DEFAULT TRUE,
  email_searchable BOOLEAN DEFAULT FALSE,
  data_sharing BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  connection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  device VARCHAR(50),
  location VARCHAR(255),
  ip_address VARCHAR(45),
  browser VARCHAR(100),
  status ENUM('success', 'failed') DEFAULT 'success',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (first_name, last_name, email, password, phone, bio, location, website, birth_date, gender, language, avatar) VALUES
('John', 'Doe', 'john.doe@example.com', 'azertyuiop', '+33 6 12 34 56 78', 'Développeur passionné par les nouvelles technologies.', 'Paris, France', 'https://johndoe.dev', '1990-01-15', 'Homme', 'Français', 'https://picsum.photos/seed/user123/200/200.jpg');

SET @user_id = LAST_INSERT_ID();

INSERT INTO user_settings (user_id, two_factor_enabled, email_notifications, private_session, public_profile, email_searchable, data_sharing, timezone, date_format) VALUES
(@user_id, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE, 'Europe/Paris', 'DD/MM/YYYY');

INSERT INTO user_connections (user_id, connection_date, device, location, ip_address, browser, status) VALUES
(@user_id, '2024-01-15T14:30:00Z', 'desktop', 'Paris, France', '192.168.1.1', 'Chrome 120', 'success'),
(@user_id, '2024-01-15T09:15:00Z', 'mobile', 'Lyon, France', '192.168.1.2', 'Safari 17', 'success');

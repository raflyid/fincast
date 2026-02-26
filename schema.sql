-- Jalankan SQL ini di MySQL untuk setup database Fincast

CREATE DATABASE IF NOT EXISTS fincast CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fincast;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forecast_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount BIGINT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_cat (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed default categories for existing users
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Makan', 1 FROM users;
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Transport', 2 FROM users;
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Belanja', 3 FROM users;
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Tagihan', 4 FROM users;
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Hiburan', 5 FROM users;
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Kesehatan', 6 FROM users;
INSERT IGNORE INTO user_categories (user_id, name, sort_order)
SELECT id, 'Lainnya', 7 FROM users;

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_budget (user_id, category, month, year),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

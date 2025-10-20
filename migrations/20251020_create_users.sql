-- create users table
CREATE TABLE IF NOT EXISTS users (
  id varchar(32) PRIMARY KEY,
  email varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);

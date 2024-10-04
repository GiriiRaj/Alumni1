-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS alumni_db;

-- Use the alumni_db database
USE alumni_db;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6) NOT NULL,
    otp_expiry DATETIME NOT NULL,
    name VARCHAR(255) NOT NULL, 
    graduation_year INT NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    otp_verified BOOLEAN DEFAULT FALSE 
);

-- Create the messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Ensure referential integrity
);


-- Create a table to manage events (optional but useful if you want to store event details separately)
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_description TEXT
);
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donorName VARCHAR(255) NOT NULL,
    donorEmail VARCHAR(255) NOT NULL,
    donationAmount DECIMAL(10, 2) NOT NULL
);
ALTER TABLE users
MODIFY COLUMN name VARCHAR(255) NOT NULL,
MODIFY COLUMN graduation_year INT NOT NULL,
MODIFY COLUMN occupation VARCHAR(255) NOT NULL,
MODIFY COLUMN otp_verified BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
select * from event_registrations;
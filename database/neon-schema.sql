-- Neon PostgreSQL Schema for Grace Community Church

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP NULL,
    failedLoginAttempts INTEGER DEFAULT 0,
    lockUntil TIMESTAMP NULL
);

-- Videos table for sermon/service videos
CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'youtube',
    thumbnail TEXT,
    duration VARCHAR(10),
    description TEXT,
    featured BOOLEAN DEFAULT FALSE,
    date DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table for church configuration
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'new'
);

-- Insert default admin user (password: churchadmin123)
INSERT INTO users (username, passwordHash, role) VALUES 
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdEZwNEy0P7nUgW', 'admin');

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
('churchName', 'Grace Community Church'),
('welcomeMessage', 'Welcome to our church family! We''re glad you''re here.'),
('about', 'Grace Community Church has been serving our community for over 25 years. We believe in creating a welcoming environment where people can grow in their faith and connect with others.'),
('pastor', 'Pastor John Smith'),
('service_times', 'Sunday: 9:00 AM & 11:00 AM, Wednesday: 7:00 PM'),
('address', '123 Faith Avenue, Your City, ST 12345'),
('phone', '(555) 123-4567'),
('email', 'info@gracecommunity.church'),
('facebook', 'https://facebook.com/gracecommunity'),
('instagram', 'https://instagram.com/gracecommunity'),
('youtube', 'https://youtube.com/gracecommunity');

-- Insert sample videos
INSERT INTO videos (title, url, type, thumbnail, duration, description, featured, date) VALUES 
('Sunday Service - October 1, 2025', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', '45:30', 'Join us for our weekly Sunday service with Pastor John.', TRUE, '2025-10-01'),
('Bible Study - Wednesday Evening', 'https://www.youtube.com/watch?v=example2', 'youtube', 'https://img.youtube.com/vi/example2/maxresdefault.jpg', '30:15', 'Weekly Bible study exploring the Gospel of Matthew.', FALSE, '2025-09-27'),
('Youth Group Meeting', 'https://www.youtube.com/watch?v=example3', 'youtube', 'https://img.youtube.com/vi/example3/maxresdefault.jpg', '25:45', 'Our weekly youth group meeting with games and discussion.', FALSE, '2025-09-25');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { User } = require('../models/User');

const dbPath = path.join(__dirname, 'church.db');

/**
 * Initialize the SQLite database with required tables
 */
const initializeDatabase = () => {
    // Ensure database directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err);
            return;
        }
        console.log('✅ Connected to SQLite database');
    });

    // Create tables
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                passwordHash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                permissions TEXT DEFAULT '[]',
                failedLoginAttempts INTEGER DEFAULT 0,
                lockUntil TEXT NULL,
                lastLogin TEXT NULL,
                isActive INTEGER DEFAULT 1,
                createdAt TEXT DEFAULT (datetime('now')),
                updatedAt TEXT DEFAULT (datetime('now'))
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating users table:', err);
            } else {
                console.log('✅ Users table ready');
            }
        });

        // Videos table
        db.run(`
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL CHECK(type IN ('youtube', 'upload')),
                url TEXT NOT NULL,
                thumbnail TEXT,
                duration INTEGER,
                isCurrentVideo INTEGER DEFAULT 0,
                viewCount INTEGER DEFAULT 0,
                isActive INTEGER DEFAULT 1,
                createdBy INTEGER,
                createdAt TEXT DEFAULT (datetime('now')),
                updatedAt TEXT DEFAULT (datetime('now')),
                publishedAt TEXT,
                FOREIGN KEY (createdBy) REFERENCES users(id)
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating videos table:', err);
            } else {
                console.log('✅ Videos table ready');
            }
        });

        // Settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                type TEXT DEFAULT 'string',
                updatedBy INTEGER,
                updatedAt TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (updatedBy) REFERENCES users(id)
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating settings table:', err);
            } else {
                console.log('✅ Settings table ready');
            }
        });

        // Security logs table
        db.run(`
            CREATE TABLE IF NOT EXISTS security_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                username TEXT,
                ip_address TEXT,
                user_agent TEXT,
                details TEXT,
                timestamp TEXT DEFAULT (datetime('now'))
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating security_logs table:', err);
            } else {
                console.log('✅ Security logs table ready');
            }
        });

        // Initialize default data
        initializeDefaultData(db);
    });

    return db;
};

/**
 * Initialize default settings and users
 */
const initializeDefaultData = async (db) => {
    try {
        // Initialize default users
        await User.initializeDefaultUsers();

        // Initialize default settings
        const defaultSettings = [
            { key: 'church_name', value: 'Grace Community Church', type: 'string' },
            { key: 'church_address', value: '123 Faith Street, Your City, State 12345', type: 'string' },
            { key: 'church_phone', value: '(555) 123-4567', type: 'string' },
            { key: 'church_email', value: 'info@gracecommunity.org', type: 'string' },
            { key: 'social_facebook', value: 'https://facebook.com/gracecommunity', type: 'url' },
            { key: 'social_instagram', value: 'https://instagram.com/gracecommunity', type: 'url' },
            { key: 'social_youtube', value: 'https://youtube.com/gracecommunity', type: 'url' },
            { key: 'social_twitter', value: 'https://twitter.com/gracecommunity', type: 'url' },
            { key: 'max_login_attempts', value: '5', type: 'number' },
            { key: 'lockout_duration', value: '15', type: 'number' },
            { key: 'jwt_expiry', value: '15m', type: 'string' }
        ];

        for (const setting of defaultSettings) {
            db.run(`
                INSERT OR IGNORE INTO settings (key, value, type) 
                VALUES (?, ?, ?)
            `, [setting.key, setting.value, setting.type]);
        }

        console.log('✅ Default settings initialized');

        // Initialize sample videos
        const sampleVideos = [
            {
                title: 'Welcome Message',
                description: 'Pastor\'s welcome message to our church family',
                type: 'youtube',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
                isCurrentVideo: 1,
                publishedAt: new Date().toISOString()
            },
            {
                title: 'Faith in Action',
                description: 'Sunday Service - March 15, 2025',
                type: 'youtube',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
                publishedAt: '2025-03-15T10:00:00Z'
            },
            {
                title: 'Love Thy Neighbor',
                description: 'Sunday Service - March 8, 2025',
                type: 'youtube',
                url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
                publishedAt: '2025-03-08T10:00:00Z'
            }
        ];

        // Check if videos already exist
        db.get('SELECT COUNT(*) as count FROM videos', (err, row) => {
            if (err) {
                console.error('❌ Error checking videos:', err);
                return;
            }

            if (row.count === 0) {
                for (const video of sampleVideos) {
                    db.run(`
                        INSERT INTO videos (title, description, type, url, thumbnail, isCurrentVideo, publishedAt)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [
                        video.title, 
                        video.description, 
                        video.type, 
                        video.url, 
                        video.thumbnail, 
                        video.isCurrentVideo || 0, 
                        video.publishedAt
                    ]);
                }
                console.log('✅ Sample videos initialized');
            }
        });

    } catch (error) {
        console.error('❌ Error initializing default data:', error);
    }
};

/**
 * Create database backup
 */
const createBackup = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, `backup_${timestamp}.db`);
    
    return new Promise((resolve, reject) => {
        const source = fs.createReadStream(dbPath);
        const destination = fs.createWriteStream(backupPath);
        
        source.pipe(destination);
        source.on('end', () => resolve(backupPath));
        source.on('error', reject);
    });
};

/**
 * Database maintenance - clean old logs
 */
const cleanupOldLogs = () => {
    const db = new sqlite3.Database(dbPath);
    
    // Keep only last 1000 security log entries
    db.run(`
        DELETE FROM security_logs 
        WHERE id NOT IN (
            SELECT id FROM security_logs 
            ORDER BY timestamp DESC 
            LIMIT 1000
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error cleaning up logs:', err);
        } else {
            console.log('✅ Old security logs cleaned up');
        }
        db.close();
    });
};

module.exports = {
    initializeDatabase,
    createBackup,
    cleanupOldLogs
};
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/church.db');

class User {
    constructor() {
        this.db = new sqlite3.Database(dbPath);
    }

    /**
     * Find user by username
     */
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                SELECT * FROM users 
                WHERE username = ? AND isActive = 1
            `;
            
            db.get(query, [username], (err, row) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        row.permissions = JSON.parse(row.permissions || '[]');
                        row.isLocked = () => {
                            return row.lockUntil && new Date(row.lockUntil) > new Date();
                        };
                    }
                    resolve(row);
                }
            });
        });
    }

    /**
     * Find user by ID
     */
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                SELECT * FROM users 
                WHERE id = ? AND isActive = 1
            `;
            
            db.get(query, [id], (err, row) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        row.permissions = JSON.parse(row.permissions || '[]');
                    }
                    resolve(row);
                }
            });
        });
    }

    /**
     * Find all users
     */
    static async findAll() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                SELECT id, username, role, permissions, createdAt, lastLogin, isActive
                FROM users 
                ORDER BY createdAt DESC
            `;
            
            db.all(query, [], (err, rows) => {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    const users = rows.map(row => ({
                        ...row,
                        permissions: JSON.parse(row.permissions || '[]')
                    }));
                    resolve(users);
                }
            });
        });
    }

    /**
     * Create a new user
     */
    static async create(userData) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                INSERT INTO users (username, passwordHash, role, permissions, createdAt, isActive)
                VALUES (?, ?, ?, ?, datetime('now'), 1)
            `;
            
            const permissions = JSON.stringify(userData.permissions || []);
            
            db.run(query, [
                userData.username,
                userData.passwordHash,
                userData.role,
                permissions
            ], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, ...userData });
                }
            });
        });
    }

    /**
     * Update user password
     */
    static async updatePassword(userId, newPasswordHash) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                UPDATE users 
                SET passwordHash = ?, updatedAt = datetime('now')
                WHERE id = ?
            `;
            
            db.run(query, [newPasswordHash, userId], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * Record failed login attempt
     */
    static async recordFailedLogin(userId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            
            // First, get current failed attempts
            db.get('SELECT failedLoginAttempts FROM users WHERE id = ?', [userId], (err, row) => {
                if (err) {
                    db.close();
                    return reject(err);
                }

                const currentAttempts = (row?.failedLoginAttempts || 0) + 1;
                let lockUntil = null;

                // Lock account after 5 failed attempts for 15 minutes
                if (currentAttempts >= 5) {
                    lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
                }

                const query = `
                    UPDATE users 
                    SET failedLoginAttempts = ?, 
                        lockUntil = ?,
                        updatedAt = datetime('now')
                    WHERE id = ?
                `;

                db.run(query, [currentAttempts, lockUntil, userId], function(err) {
                    db.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(currentAttempts);
                    }
                });
            });
        });
    }

    /**
     * Clear failed login attempts
     */
    static async clearFailedAttempts(userId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                UPDATE users 
                SET failedLoginAttempts = 0, 
                    lockUntil = NULL,
                    updatedAt = datetime('now')
                WHERE id = ?
            `;
            
            db.run(query, [userId], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * Update last login time
     */
    static async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(dbPath);
            const query = `
                UPDATE users 
                SET lastLogin = datetime('now'),
                    updatedAt = datetime('now')
                WHERE id = ?
            `;
            
            db.run(query, [userId], function(err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * Initialize default users
     */
    static async initializeDefaultUsers() {
        try {
            // Check if users already exist
            const existingUsers = await User.findAll();
            if (existingUsers.length > 0) {
                console.log('✅ Default users already exist');
                return;
            }

            console.log('🔧 Creating default users...');

            // Create default admin user
            const adminPasswordHash = await bcrypt.hash('church2025', 12);
            await User.create({
                username: 'admin',
                passwordHash: adminPasswordHash,
                role: 'administrator',
                permissions: ['manage_videos', 'manage_users', 'manage_settings', 'view_analytics']
            });

            // Create default pastor user
            const pastorPasswordHash = await bcrypt.hash('grace123', 12);
            await User.create({
                username: 'pastor',
                passwordHash: pastorPasswordHash,
                role: 'pastor',
                permissions: ['manage_videos', 'manage_settings']
            });

            console.log('✅ Default users created successfully');
            console.log('   Admin: username=admin, password=church2025');
            console.log('   Pastor: username=pastor, password=grace123');
            console.log('   ⚠️  Change these passwords before production deployment!');

        } catch (error) {
            console.error('❌ Error creating default users:', error);
            throw error;
        }
    }
}

module.exports = { User };
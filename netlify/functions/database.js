// PlanetScale Database Connection for Netlify Functions
// npm install @planetscale/database

import { connect } from '@planetscale/database'

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD
}

const conn = connect(config)

// User Management Functions
export class User {
  static async findByUsername(username) {
    const results = await conn.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    return results.rows[0] || null
  }

  static async create(userData) {
    const { username, passwordHash, role = 'admin' } = userData
    const results = await conn.execute(
      'INSERT INTO users (username, passwordHash, role, createdAt) VALUES (?, ?, ?, NOW())',
      [username, passwordHash, role]
    )
    return results.insertId
  }

  static async updateLastLogin(userId) {
    await conn.execute(
      'UPDATE users SET lastLogin = NOW() WHERE id = ?',
      [userId]
    )
  }
}

// Video Management Functions
export class Video {
  static async findAll() {
    const results = await conn.execute('SELECT * FROM videos ORDER BY date DESC')
    return results.rows
  }

  static async findFeatured() {
    const results = await conn.execute(
      'SELECT * FROM videos WHERE featured = 1 ORDER BY date DESC LIMIT 1'
    )
    return results.rows[0] || null
  }

  static async create(videoData) {
    const { title, url, type, thumbnail, duration, description, featured = 0 } = videoData
    const results = await conn.execute(
      'INSERT INTO videos (title, url, type, thumbnail, duration, description, featured, date) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [title, url, type, thumbnail, duration, description, featured]
    )
    return results.insertId
  }

  static async delete(id) {
    await conn.execute('DELETE FROM videos WHERE id = ?', [id])
  }
}

// Settings Management Functions
export class Settings {
  static async getAll() {
    const results = await conn.execute('SELECT * FROM settings')
    const settings = {}
    results.rows.forEach(row => {
      settings[row.key] = row.value
    })
    return settings
  }

  static async update(key, value) {
    await conn.execute(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
      [key, value, value]
    )
  }
}

// Contact Form Storage
export class Contact {
  static async create(contactData) {
    const { name, email, subject, message } = contactData
    const results = await conn.execute(
      'INSERT INTO contacts (name, email, subject, message, createdAt) VALUES (?, ?, ?, ?, NOW())',
      [name, email, subject, message]
    )
    return results.insertId
  }
}
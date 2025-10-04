const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Hardcoded admin user for demo - replace with real database
const ADMIN_USER = {
  id: 1,
  username: 'admin',
  // Password: 'churchadmin123' (hashed with bcrypt)
  passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdEZwNEy0P7nUgW',
  role: 'admin',
  permissions: ['manage_users', 'manage_videos', 'manage_settings']
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password, rememberMe = false } = JSON.parse(event.body);

    // Basic validation
    if (!username || !password || username.length < 3 || password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid input',
          details: 'Username must be at least 3 characters, password at least 6 characters'
        })
      };
    }

    // Check username
    if (username !== ADMIN_USER.username) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, ADMIN_USER.passwordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Generate JWT tokens
    const tokenPayload = {
      userId: ADMIN_USER.id,
      username: ADMIN_USER.username,
      role: ADMIN_USER.role,
      permissions: ADMIN_USER.permissions
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: ADMIN_USER.id }, JWT_SECRET, { 
      expiresIn: rememberMe ? '30d' : '1d' 
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Set-Cookie': [
          `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=900`,
          `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${rememberMe ? 2592000 : 86400}`
        ].join(', ')
      },
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        user: {
          id: ADMIN_USER.id,
          username: ADMIN_USER.username,
          role: ADMIN_USER.role,
          permissions: ADMIN_USER.permissions
        },
        accessToken,
        refreshToken
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
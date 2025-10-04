const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

exports.handler = async (event, context) => {
  console.log('Auth login function called');
  console.log('Environment check:', {
    hasJWTSecret: !!process.env.JWT_SECRET,
    hasDatabaseURL: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV
  });

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
    console.log('Parsing request body...');
    const { username, password, rememberMe = false } = JSON.parse(event.body);
    console.log('Login attempt for username:', username);

    // Basic validation
    if (!username || !password || username.length < 3 || password.length < 6) {
      console.log('Validation failed:', { username: username?.length, password: password?.length });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid input',
          details: 'Username must be at least 3 characters, password at least 6 characters'
        })
      };
    }

    // Find user in database
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Database connected, querying user...');
    const results = await client.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    client.release();
    console.log('Query completed, found users:', results.rows.length);

    const user = results.rows[0];
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Update last login
    const updateClient = await pool.connect();
    await updateClient.query(
      'UPDATE users SET lastLogin = NOW() WHERE id = $1',
      [user.id]
    );
    updateClient.release();

    // Generate JWT tokens
    const permissions = user.role === 'admin' 
      ? ['manage_users', 'manage_videos', 'manage_settings'] 
      : [];

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: permissions
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { 
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
          id: user.id,
          username: user.username,
          role: user.role,
          permissions: permissions
        },
        accessToken,
        refreshToken
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        type: error.name
      })
    };
  }
};
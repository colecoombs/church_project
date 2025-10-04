const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// For serverless, you'll need to use a cloud database like FaunaDB, PlanetScale, or Supabase
// This is a simplified example - you'll need to adapt your User model

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password, rememberMe = false } = JSON.parse(event.body);

    // Basic validation
    if (!username || !password || username.length < 3 || password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid input',
          details: 'Username must be at least 3 characters, password at least 6 characters'
        })
      };
    }

    // TODO: Replace with your cloud database query
    // const user = await findUserByUsername(username);
    
    // For demo purposes - you'll need to implement actual database queries
    const mockUser = {
      id: 1,
      username: 'admin',
      passwordHash: '$2a$12$...' // This would come from your database
    };

    if (username !== mockUser.username) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, mockUser.passwordHash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }

    // Generate JWT token
    const tokenPayload = {
      userId: mockUser.id,
      username: mockUser.username,
      role: 'admin',
      permissions: ['manage_users', 'manage_videos', 'manage_settings']
    };

    const accessToken = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: mockUser.id },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '1d' }
    );

    return {
      statusCode: 200,
      headers: {
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
          id: mockUser.id,
          username: mockUser.username,
          role: 'admin',
          permissions: tokenPayload.permissions
        },
        accessToken,
        refreshToken
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
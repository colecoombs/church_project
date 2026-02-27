const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

exports.handler = async (event, context) => {
  console.log('Auth verify function called');

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get token from cookies
    const cookies = event.headers.cookie || '';
    console.log('Cookies received:', cookies);

    let accessToken = null;
    
    // Parse cookies to extract accessToken
    if (cookies) {
      const cookieMatch = cookies.match(/accessToken=([^;]+)/);
      if (cookieMatch) {
        accessToken = cookieMatch[1];
      }
    }

    console.log('Access token found:', !!accessToken);

    if (!accessToken) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No token provided' })
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    console.log('Token verified for user:', decoded.username);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        user: {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role,
          permissions: decoded.permissions
        }
      })
    };

  } catch (error) {
    console.error('Token verification error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        error: 'Invalid token',
        details: error.message
      })
    };
  }
};
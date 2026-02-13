const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Verify JWT token from Authorization header or cookies
 * @param {Object} event - Netlify function event object
 * @returns {Object} - { authorized: boolean, user: object, error: string }
 */
function verifyAuth(event) {
  try {
    let token = null;

    // Check Authorization header first (Bearer token)
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fall back to cookies if no Authorization header
    if (!token) {
      const cookies = event.headers.cookie || '';
      if (cookies) {
        const cookieMatch = cookies.match(/accessToken=([^;]+)/);
        if (cookieMatch) {
          token = cookieMatch[1];
        }
      }
    }

    if (!token) {
      return {
        authorized: false,
        error: 'No authentication token provided'
      };
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      authorized: true,
      user: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        permissions: decoded.permissions || []
      }
    };

  } catch (error) {
    console.error('Auth verification error:', error.message);
    return {
      authorized: false,
      error: 'Invalid or expired token'
    };
  }
}

/**
 * Check if user has required permission
 * @param {Object} user - User object from verifyAuth
 * @param {string} permission - Required permission
 * @returns {boolean}
 */
function hasPermission(user, permission) {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if user is admin
 * @param {Object} user - User object from verifyAuth
 * @returns {boolean}
 */
function isAdmin(user) {
  return user && user.role === 'admin';
}

module.exports = {
  verifyAuth,
  hasPermission,
  isAdmin
};

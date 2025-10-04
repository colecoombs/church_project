const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = (req, res, next) => {
    // Get token from cookies or Authorization header
    const token = req.cookies.accessToken || 
                  (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

    if (!token) {
        return res.status(401).json({
            error: 'Access token required',
            code: 'NO_TOKEN'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        } else {
            logger.error('Token verification error:', error);
            return res.status(500).json({
                error: 'Token verification failed'
            });
        }
    }
};

/**
 * Middleware to check if user has specific permission
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            logger.warn(`Access denied for user ${req.user.username}: missing permission ${permission}`);
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: permission
            });
        }

        next();
    };
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        if (req.user.role !== role && req.user.role !== 'administrator') {
            logger.warn(`Access denied for user ${req.user.username}: insufficient role (required: ${role}, has: ${req.user.role})`);
            return res.status(403).json({
                error: 'Insufficient role',
                required: role,
                current: req.user.role
            });
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
    const token = req.cookies.accessToken || 
                  (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        req.user = null;
    }

    next();
};

module.exports = {
    authenticateToken,
    requirePermission,
    requireRole,
    optionalAuth
};
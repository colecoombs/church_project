const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../middleware/logger');

const router = express.Router();

// JWT Secret (in production, use a strong secret from environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', [
    body('username').trim().isLength({ min: 3 }).escape(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Invalid input',
                details: errors.array()
            });
        }

        const { username, password, rememberMe = false } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;

        // Find user
        const user = await User.findByUsername(username);
        if (!user) {
            logger.warn(`Login attempt with invalid username: ${username} from IP: ${clientIP}`);
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            logger.warn(`Login attempt on locked account: ${username} from IP: ${clientIP}`);
            return res.status(423).json({
                error: 'Account temporarily locked due to too many failed attempts',
                lockUntil: user.lockUntil
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            // Record failed attempt
            await User.recordFailedLogin(user.id);
            
            logger.warn(`Failed login attempt for user: ${username} from IP: ${clientIP}`);
            
            return res.status(401).json({
                error: 'Invalid credentials',
                attemptsRemaining: Math.max(0, 5 - (user.failedLoginAttempts + 1))
            });
        }

        // Successful login - clear failed attempts
        await User.clearFailedAttempts(user.id);
        await User.updateLastLogin(user.id);

        // Generate JWT tokens
        const tokenPayload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions
        };

        const accessToken = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: rememberMe ? '30d' : '1d' }
        );

        // Set HTTP-only cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        });

        logger.info(`Successful login for user: ${username} from IP: ${clientIP}`);

        // Return user info and tokens
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                lastLogin: new Date()
            },
            accessToken, // Also in response for initial client setup
            refreshToken
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                error: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const tokenPayload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions
        };

        const newAccessToken = jwt.sign(
            tokenPayload,
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Set new access token cookie
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        logger.info(`Token refreshed for user: ${user.username}`);

        res.json({
            success: true,
            accessToken: newAccessToken
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Invalid or expired refresh token'
            });
        }

        logger.error('Token refresh error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear tokens
 * @access  Private
 */
router.post('/logout', authenticateToken, (req, res) => {
    try {
        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        logger.info(`User logged out: ${req.user.username}`);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify current authentication status
 * @access  Private
 */
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(401).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        logger.error('Auth verification error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', [
    authenticateToken,
    body('currentPassword').isLength({ min: 6 }),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Invalid input',
                details: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Verify current password
        const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValidCurrentPassword) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await User.updatePassword(user.id, newPasswordHash);

        logger.info(`Password changed for user: ${user.username}`);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        logger.error('Password change error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/users', authenticateToken, async (req, res) => {
    try {
        // Check if user has admin permissions
        if (!req.user.permissions.includes('manage_users')) {
            return res.status(403).json({
                error: 'Insufficient permissions'
            });
        }

        const users = await User.findAll();
        
        // Remove password hashes from response
        const safeUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive
        }));

        res.json({
            success: true,
            users: safeUsers
        });

    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

module.exports = router;
/**
 * PRODUCTION-READY AUTHENTICATION EXAMPLE
 * 
 * This file demonstrates how to implement secure authentication
 * for production use with proper server-side validation.
 * 
 * ⚠️ This is an EXAMPLE - not functional without a backend server
 */

class ProductionAuth {
    constructor() {
        this.apiUrl = process.env.API_URL || 'https://your-api-domain.com/api';
        this.tokenKey = 'auth_token';
        this.refreshTokenKey = 'refresh_token';
        this.csrfToken = null;
        this.init();
    }

    async init() {
        await this.initializeCSRF();
        this.setupInterceptors();
        this.checkExistingSession();
    }

    /**
     * Initialize CSRF protection
     */
    async initializeCSRF() {
        try {
            const response = await fetch(`${this.apiUrl}/csrf-token`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.csrfToken = data.csrfToken;
            }
        } catch (error) {
            console.error('Failed to initialize CSRF token:', error);
        }
    }

    /**
     * Set up HTTP interceptors for automatic token handling
     */
    setupInterceptors() {
        // Intercept all fetch requests to add authentication headers
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            const token = this.getStoredToken();
            
            if (token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': this.csrfToken
                };
            }
            
            options.credentials = 'include'; // Include HTTP-only cookies
            
            const response = await originalFetch(url, options);
            
            // Handle token expiration
            if (response.status === 401) {
                await this.handleTokenExpiration();
            }
            
            return response;
        };
    }

    /**
     * Login with username and password
     */
    async login(username, password, rememberMe = false) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    password,
                    rememberMe
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store tokens securely
                this.storeTokens(data.accessToken, data.refreshToken);
                
                // Store user info (non-sensitive data only)
                this.storeUserInfo(data.user);
                
                return { success: true, user: data.user };
            } else {
                return { 
                    success: false, 
                    error: data.message || 'Login failed',
                    remainingAttempts: data.remainingAttempts
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                error: 'Network error. Please try again.' 
            };
        }
    }

    /**
     * Logout user and clear all session data
     */
    async logout() {
        try {
            await fetch(`${this.apiUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getStoredToken()}`,
                    'X-CSRF-Token': this.csrfToken
                },
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearStoredData();
            window.location.href = '/admin/login.html';
        }
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken() {
        try {
            const refreshToken = this.getStoredRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch(`${this.apiUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    refreshToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.storeTokens(data.accessToken, data.refreshToken);
                return true;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Handle token expiration
     */
    async handleTokenExpiration() {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
            this.logout();
        }
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        const userInfo = this.getStoredUserInfo();
        return userInfo && userInfo.permissions.includes(permission);
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        const userInfo = this.getStoredUserInfo();
        return userInfo && userInfo.role === role;
    }

    /**
     * Verify current session is valid
     */
    async verifySession() {
        try {
            const response = await fetch(`${this.apiUrl}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getStoredToken()}`,
                    'X-CSRF-Token': this.csrfToken
                },
                credentials: 'include'
            });

            return response.ok;
        } catch (error) {
            console.error('Session verification error:', error);
            return false;
        }
    }

    /**
     * Store tokens securely (HTTP-only cookies preferred)
     */
    storeTokens(accessToken, refreshToken) {
        // In production, these should be HTTP-only cookies set by the server
        // This is just for demonstration
        sessionStorage.setItem(this.tokenKey, accessToken);
        if (refreshToken) {
            localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
    }

    /**
     * Store user information (non-sensitive data only)
     */
    storeUserInfo(userInfo) {
        const safeUserInfo = {
            id: userInfo.id,
            username: userInfo.username,
            role: userInfo.role,
            permissions: userInfo.permissions,
            lastLogin: userInfo.lastLogin
        };
        
        sessionStorage.setItem('userInfo', JSON.stringify(safeUserInfo));
    }

    /**
     * Get stored access token
     */
    getStoredToken() {
        return sessionStorage.getItem(this.tokenKey);
    }

    /**
     * Get stored refresh token
     */
    getStoredRefreshToken() {
        return localStorage.getItem(this.refreshTokenKey);
    }

    /**
     * Get stored user information
     */
    getStoredUserInfo() {
        const userInfo = sessionStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    /**
     * Clear all stored authentication data
     */
    clearStoredData() {
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem('userInfo');
        localStorage.removeItem(this.refreshTokenKey);
        
        // Clear HTTP-only cookies (would be done by server)
        // document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; HttpOnly; Secure;';
    }

    /**
     * Check if user is currently logged in
     */
    isLoggedIn() {
        const token = this.getStoredToken();
        const userInfo = this.getStoredUserInfo();
        
        return !!(token && userInfo);
    }

    /**
     * Check existing session on page load
     */
    async checkExistingSession() {
        if (this.isLoggedIn()) {
            // Verify session is still valid
            const isValid = await this.verifySession();
            
            if (isValid) {
                // Redirect to dashboard if on login page
                if (window.location.pathname.includes('login.html')) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                this.logout();
            }
        } else {
            // Redirect to login if not on login page
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }
}

/**
 * SERVER-SIDE AUTHENTICATION ENDPOINTS (Node.js/Express Example)
 * 
 * These would be implemented on your backend server:
 */

/*
// Authentication routes (server-side)
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csrf = require('csurf');

const app = express();

// Security middleware
app.use(helmet());
app.use(csrf({ cookie: true }));

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

// Login endpoint
app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    // Find user in database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Log failed attempt
      await logSecurityEvent('LOGIN_FAILED', username, req.ip);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role,
        permissions: user.permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: rememberMe ? '30d' : '1d' }
    );
    
    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    });
    
    // Update last login
    await User.updateOne({ _id: user.id }, { lastLogin: new Date() });
    
    // Log successful login
    await logSecurityEvent('LOGIN_SUCCESS', username, req.ip);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        lastLogin: new Date()
      },
      accessToken, // Also send in response body for initial setup
      refreshToken
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Token refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role,
        permissions: user.permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    // Set new HTTP-only cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    });
    
    res.json({
      success: true,
      accessToken: newAccessToken
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  // Clear cookies
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  // In a more sophisticated setup, you might also:
  // - Add tokens to a blacklist
  // - Log the logout event
  
  res.json({ success: true });
});

// Middleware to verify JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken || 
                req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Protected route example
app.get('/api/admin/videos', authenticateToken, async (req, res) => {
  // Check permissions
  if (!req.user.permissions.includes('manage_videos')) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  
  // Handle request...
});
*/

// Export for reference
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionAuth;
}
// Enhanced Admin Authentication System (Demo Implementation)
// ⚠️ WARNING: This is still a CLIENT-SIDE demo implementation
// For production, implement proper server-side authentication

class EnhancedAdminAuth {
    constructor() {
        this.apiUrl = '/api'; // Would be your actual API endpoint
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.init();
    }

    init() {
        this.setupLoginForm();
        this.checkExistingSession();
        this.setupSecurityHeaders();
    }

    setupSecurityHeaders() {
        // Simulate security headers that would be set server-side
        console.log('Security Headers (would be set server-side):');
        console.log('X-Content-Type-Options: nosniff');
        console.log('X-Frame-Options: DENY');
        console.log('X-XSS-Protection: 1; mode=block');
        console.log('Strict-Transport-Security: max-age=31536000');
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Check if account is locked
        if (this.isAccountLocked(username)) {
            this.showError('Account temporarily locked due to too many failed attempts. Please try again later.');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        // Simulate API delay for realistic testing
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // In production, this would be an actual API call
            const authResult = await this.authenticateUser(username, password);
            
            if (authResult.success) {
                this.clearFailedAttempts(username);
                this.createSecureSession(authResult.user, authResult.token, rememberMe);
                this.showSuccess('Login successful! Redirecting...');
                
                // Log successful login (would be server-side in production)
                this.logSecurityEvent('LOGIN_SUCCESS', username);
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                this.recordFailedAttempt(username);
                this.logSecurityEvent('LOGIN_FAILED', username);
                this.showError('Invalid username or password. Please try again.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication service unavailable. Please try again later.');
        }

        this.showLoading(false);
    }

    async authenticateUser(username, password) {
        // Simulate server-side authentication
        // In production, this would make an actual API call
        
        const validUsers = [
            { 
                id: 1,
                username: 'admin', 
                passwordHash: this.hashPassword('church2025'), // In production, this would be properly hashed
                role: 'administrator',
                permissions: ['manage_videos', 'manage_users', 'manage_settings']
            },
            { 
                id: 2,
                username: 'pastor', 
                passwordHash: this.hashPassword('grace123'),
                role: 'pastor',
                permissions: ['manage_videos', 'manage_settings']
            }
        ];

        const user = validUsers.find(u => u.username === username);
        
        if (user && this.verifyPassword(password, user.passwordHash)) {
            // Generate JWT-style token (in production, this would be done server-side)
            const token = this.generateJWTToken(user);
            
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    permissions: user.permissions
                },
                token: token
            };
        }

        return { success: false };
    }

    // Simple password hashing (FOR DEMO ONLY - use bcrypt in production)
    hashPassword(password) {
        // This is NOT secure - just for demonstration
        return btoa(password + 'salt_string');
    }

    verifyPassword(password, hash) {
        // This is NOT secure - just for demonstration
        return this.hashPassword(password) === hash;
    }

    // Generate JWT-style token (FOR DEMO ONLY - use proper JWT library in production)
    generateJWTToken(user) {
        const header = {
            alg: "HS256",
            typ: "JWT"
        };

        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            permissions: user.permissions,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };

        // This is NOT secure - just for demonstration of JWT structure
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = btoa(`${encodedHeader}.${encodedPayload}.demo_signature`);

        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    createSecureSession(user, token, rememberMe) {
        const sessionData = {
            token: token,
            user: user,
            loginTime: new Date().toISOString(),
            expiresAt: rememberMe ? 
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            sessionId: this.generateSessionId()
        };

        const storage = rememberMe ? localStorage : sessionStorage;
        
        // In production, you would use HTTP-only cookies for token storage
        storage.setItem('churchAdminSession', JSON.stringify(sessionData));
        
        // Set CSRF token (would be server-side in production)
        storage.setItem('csrfToken', this.generateCSRFToken());
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 16);
    }

    isAccountLocked(username) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        const userAttempts = attempts[username];
        
        if (!userAttempts) return false;
        
        const now = Date.now();
        if (userAttempts.count >= this.maxLoginAttempts) {
            const timeSinceLastAttempt = now - userAttempts.lastAttempt;
            return timeSinceLastAttempt < this.lockoutDuration;
        }
        
        return false;
    }

    recordFailedAttempt(username) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        
        if (!attempts[username]) {
            attempts[username] = { count: 0, lastAttempt: 0 };
        }
        
        attempts[username].count++;
        attempts[username].lastAttempt = Date.now();
        
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
        
        const remaining = this.maxLoginAttempts - attempts[username].count;
        if (remaining > 0) {
            this.showError(`Invalid credentials. ${remaining} attempts remaining before account lockout.`);
        } else {
            this.showError(`Account locked for ${this.lockoutDuration / 60000} minutes due to too many failed attempts.`);
        }
    }

    clearFailedAttempts(username) {
        const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
        delete attempts[username];
        localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    }

    checkExistingSession() {
        if (this.isLoggedIn()) {
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }
    }

    isLoggedIn() {
        const sessionData = this.getSessionData();
        if (!sessionData) return false;

        // Validate JWT token (simplified validation for demo)
        if (!this.validateToken(sessionData.token)) {
            this.logout();
            return false;
        }

        const now = new Date();
        const expiresAt = new Date(sessionData.expiresAt);

        if (now > expiresAt) {
            this.logout();
            return false;
        }

        return true;
    }

    validateToken(token) {
        try {
            // Simple token validation (in production, use proper JWT validation)
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            return payload.exp > now;
        } catch (error) {
            return false;
        }
    }

    getSessionData() {
        let sessionData = localStorage.getItem('churchAdminSession');
        if (!sessionData) {
            sessionData = sessionStorage.getItem('churchAdminSession');
        }
        
        return sessionData ? JSON.parse(sessionData) : null;
    }

    getUserPermissions() {
        const sessionData = this.getSessionData();
        return sessionData ? sessionData.user.permissions : [];
    }

    hasPermission(permission) {
        const permissions = this.getUserPermissions();
        return permissions.includes(permission);
    }

    logSecurityEvent(event, username, details = {}) {
        // In production, this would log to a secure server-side logging system
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            username: username,
            ip: 'N/A (client-side demo)', // Would be actual IP in production
            userAgent: navigator.userAgent,
            details: details
        };
        
        console.log('Security Event:', logEntry);
        
        // Store security log (in production, this would be server-side)
        const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
        logs.push(logEntry);
        logs.splice(-100); // Keep only last 100 entries
        localStorage.setItem('securityLogs', JSON.stringify(logs));
    }

    logout() {
        const sessionData = this.getSessionData();
        if (sessionData) {
            this.logSecurityEvent('LOGOUT', sessionData.user.username);
        }
        
        localStorage.removeItem('churchAdminSession');
        sessionStorage.removeItem('churchAdminSession');
        localStorage.removeItem('csrfToken');
        sessionStorage.removeItem('csrfToken');
        
        window.location.href = 'login.html';
    }

    // UI Methods (same as before)
    showLoading(show) {
        const loginBtn = document.querySelector('.login-btn');
        
        if (show) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<div class="loading"></div> Signing In...';
        } else {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    showSuccess(message) {
        const successDiv = document.getElementById('loginSuccess');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }

    hideMessages() {
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('loginSuccess').style.display = 'none';
    }
}

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Use enhanced auth system
    window.adminAuth = new EnhancedAdminAuth();
    
    // Log security information for development
    console.log('🔒 Security Information:');
    console.log('• Current auth system: DEVELOPMENT ONLY');
    console.log('• Token type: JWT-style (client-side demo)');
    console.log('• Storage: localStorage/sessionStorage');
    console.log('• Rate limiting: Basic client-side simulation');
    console.log('• For production: Implement server-side authentication');
});

// Export for use in other admin files
window.EnhancedAdminAuth = EnhancedAdminAuth;
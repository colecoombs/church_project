# Production Deployment Guide

## Environment Variables Required

Set these in your hosting platform's dashboard:

### Required Security Variables
```
NODE_ENV=production
JWT_SECRET=your-super-secure-64-character-random-string-here-change-this
JWT_REFRESH_SECRET=another-super-secure-64-character-random-string-change-this
PORT=10000
```

### Optional Configuration
```
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT_MINUTES=15
```

## Render.com Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main-implementation
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `church_project` repository
   - Branch: `main-implementation`

4. **Configure Service**
   - **Name**: `grace-community-church`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**
   - Go to "Environment" tab
   - Add the variables listed above
   - Use "Generate" for JWT secrets

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

## Security Checklist

- [x] JWT secrets are randomly generated
- [x] Passwords are hashed with bcrypt
- [x] Rate limiting enabled
- [x] CORS configured
- [x] Helmet security headers
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection
- [x] HTTPS enforced in production

## Post-Deployment Testing

1. **Authentication Flow**
   - Login/logout functionality
   - Token refresh mechanism
   - Password change feature

2. **Video Management**
   - Upload videos
   - Delete videos
   - Video playback

3. **Contact Form**
   - Form submission
   - Email notifications (if configured)

4. **Admin Panel**
   - Dashboard access
   - Settings management
   - User management

## Performance Optimizations

- Static files served by Render CDN
- Database queries optimized
- File uploads limited to 50MB
- Request rate limiting active
- Compression enabled

## Monitoring

- Check Render dashboard for logs
- Monitor response times
- Watch for error rates
- Set up uptime monitoring

## Domain Setup (Optional)

1. Purchase domain from registrar
2. In Render dashboard → Settings → Custom Domains
3. Add your domain
4. Update DNS records as instructed
5. SSL certificate auto-generated

## Cost Breakdown

**Render.com Free Tier:**
- Web Service: Free (with sleep after 15min inactivity)
- PostgreSQL: Free (1GB storage)
- SSL Certificate: Free
- Custom Domain: Free

**Upgrade Options:**
- $7/month: No sleep, faster builds
- Database: $7/month for more storage

## Backup Strategy

- Code: Automatically backed up via Git
- Database: Use Render's backup features
- Uploads: Consider cloud storage (AWS S3) for production

---

**Ready to deploy? Let me know when you want to proceed with the GitHub push!**
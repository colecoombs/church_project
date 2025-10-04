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

## Railway Deployment Steps (Recommended)

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub (free $5 monthly credit)

2. **Deploy from GitHub**
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Choose `church_project` repository
   - Branch: `main-implementation`

3. **Configure Environment Variables**
   - Railway auto-detects your Node.js app
   - Add these variables in the dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=[generate 64-char random string]
   JWT_REFRESH_SECRET=[generate 64-char random string]
   ```

4. **Deploy**
   - Railway automatically builds and deploys
   - Get your URL: `https://[random].up.railway.app`
   - Takes 2-3 minutes!

## Alternative: Render.com Deployment Steps

**Note**: Render free tier allows only 1 web service per account

1. **Create Render Account** (if upgrading to paid)
   - Go to https://render.com ($7/month for multiple services)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `church_project` repository
   - Branch: `main-implementation`

3. **Configure Service**
   - **Name**: `grace-community-church`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter ($7/month)

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add the variables listed above
   - Use "Generate" for JWT secrets

5. **Deploy**
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

**Railway (Recommended):**
- Free: $5 monthly credit (usually enough for small sites)
- Pro: $20/month (unlimited usage)
- SSL Certificate: Free
- Custom Domain: Free

**Render.com:**
- Free Tier: 1 web service only (with sleep after 15min)
- Starter: $7/month (no sleep, multiple services)
- PostgreSQL: Free (1GB) or $7/month
- SSL Certificate: Free
- Custom Domain: Free

**Vercel:**
- Hobby: Free (generous limits)
- Pro: $20/month
- Functions: Included
- SSL Certificate: Free
- Custom Domain: Free

## Backup Strategy

- Code: Automatically backed up via Git
- Database: Use Render's backup features
- Uploads: Consider cloud storage (AWS S3) for production

---

**Ready to deploy? Let me know when you want to proceed with the GitHub push!**
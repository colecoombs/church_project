# Neon + Netlify Deployment Guide (Free Forever!)

## 🐘 **Step 1: Set Up Neon Database (5 minutes)**

### **Create Database:**
1. Go to https://neon.tech and sign up (free with GitHub)
2. Click "Create Project"
3. Name: `grace-church-db`
4. Region: Choose closest to your audience  
5. PostgreSQL version: 15 (latest)
6. Plan: **Free** - 3GB storage, always-on, no pausing!

### **Create Schema:**
1. Go to "SQL Editor" in your Neon dashboard
2. Copy and paste the entire contents of `database/neon-schema.sql`
3. Click "Run" - this creates all tables and sample data

### **Get Connection String:**
1. Go to "Dashboard" → your project
2. Copy the "Connection string" (looks like):
   ```
   postgresql://username:password@host/database?sslmode=require
   ```

## 🚀 **Step 2: Deploy to Netlify (5 minutes)**

### **Deploy Site:**
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"  
3. Connect to GitHub and select `church_project`
4. Branch: `main-implementation`
5. Build settings:
   - **Build command**: Leave empty
   - **Publish directory**: `.` (root)
   - **Functions directory**: `netlify/functions`

### **Environment Variables:**
In Netlify Dashboard → Site Settings → Environment Variables, add:

```bash
NODE_ENV=production
JWT_SECRET=your-super-secure-64-character-random-string-here
JWT_REFRESH_SECRET=another-super-secure-64-character-random-string
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
```

**⚠️ IMPORTANT:** Replace `DATABASE_URL` with your actual Neon connection string!

### **Deploy:**
1. Click "Deploy site"
2. Wait 3-5 minutes for build to complete
3. Your site URL: `https://[random-name].netlify.app`

## 🔐 **Step 3: Test & Secure**

### **Test Login:**
- **Username**: `admin`
- **Password**: `churchadmin123`

### **🚨 Change Default Password:**
1. Go to Neon SQL Editor
2. Generate new password hash at https://bcrypt-generator.com (cost: 12)
3. Run this query:
```sql
UPDATE users 
SET passwordHash = '$2a$12$your_new_hash_here' 
WHERE username = 'admin';
```

## 📊 **Why Neon is Perfect for Churches:**

| Feature | Neon | PlanetScale | Supabase |
|---------|------|-------------|----------|
| **Cost** | ✅ Actually free | ❌ $39/month | ✅ Free (limits) |
| **Pausing** | ✅ Never | ✅ Never | ❌ 7 days |
| **Storage** | ✅ 3GB | ❌ Paid only | ✅ 500MB |
| **PostgreSQL** | ✅ Yes | ❌ MySQL | ✅ Yes |
| **Serverless** | ✅ Yes | ✅ Yes | ⚠️ Traditional |

## 🎯 **Your Complete Stack:**

- **Frontend**: Netlify (free, global CDN)
- **Backend**: Netlify Functions (serverless)
- **Database**: Neon PostgreSQL (3GB free, never pauses)
- **Security**: JWT authentication, bcrypt passwords
- **Total Cost**: **$0/month**

## 🔧 **Environment Variables Needed:**

```bash
# Netlify Environment Variables
NODE_ENV=production
JWT_SECRET=generate-64-character-random-string
JWT_REFRESH_SECRET=generate-another-64-character-string  
DATABASE_URL=your-neon-connection-string-here
```

## 🧪 **Testing Checklist:**

### **Frontend:**
- [ ] Homepage loads with church info
- [ ] Video section displays properly
- [ ] Contact form accepts submissions
- [ ] Mobile responsive design works

### **Admin Panel:**
- [ ] Can login with admin/churchadmin123
- [ ] Dashboard loads correctly
- [ ] Can add/delete videos
- [ ] Settings updates work
- [ ] Change admin password

### **Database:**
- [ ] Check Neon dashboard for query activity
- [ ] Verify contact submissions are stored
- [ ] Confirm user login tracking works

## 🚀 **Go Live Checklist:**

1. **Content Updates:**
   - [ ] Update church name and details in settings
   - [ ] Add real service videos
   - [ ] Update contact information
   - [ ] Change default admin password

2. **Security:**
   - [ ] Strong JWT secrets set
   - [ ] Default password changed
   - [ ] Test all authentication flows

3. **Performance:**
   - [ ] Test site speed
   - [ ] Verify mobile responsiveness
   - [ ] Check all links work

## 🎉 **Your Church Website is Live!**

**Features Include:**
- ✅ Professional church website
- ✅ Video sermon management
- ✅ Secure admin panel
- ✅ Contact form with database storage
- ✅ Mobile-responsive design
- ✅ Always-on database (no pausing!)
- ✅ Production-ready security

**Maintenance:** Virtually none! Neon and Netlify handle everything automatically.

**Cost:** $0/month within generous free tier limits.

Your church community now has a professional, reliable website! 🙏
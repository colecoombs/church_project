# Grace Community Church Website# Grace Community Church Website# Grace Community Church Website



A modern, responsive church website built with Netlify Functions and Neon PostgreSQL - completely free to host and maintain.



## ✨ FeaturesA modern, responsive church website with video management and secure authentication.A modern, responsive website for a local church featuring video streaming, content management, and social media integration.



- **Modern Responsive Design**: Mobile-first design that works on all devices

- **Video Management**: YouTube integration with admin controls

- **Secure Admin Panel**: JWT-based authentication with PostgreSQL storage## Features## Features

- **Always-On Database**: Neon PostgreSQL (never pauses, 3GB free)

- **Serverless Backend**: Netlify Functions for API endpoints

- **Contact Form**: Database-stored contact submissions

- **Security Features**: JWT tokens, bcrypt hashing, input validation- **Modern Responsive Design**: Mobile-first design that works on all devices### Public Website



## 🚀 Quick Deploy- **Video Management**: YouTube integration and video file uploads- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices



[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/colecoombs/church_project)- **Secure Admin Panel**: JWT-based authentication with role-based access- **Video Player**: Supports both YouTube videos and uploaded video files



## 🏗️ Architecture- **Database-Driven**: SQLite database for videos, users, and settings- **Video Library**: Browse and watch previous sermons and messages



- **Frontend**: Static HTML/CSS/JS hosted on Netlify- **Security Features**: Rate limiting, password hashing, CORS protection- **Social Media Integration**: Links to church's social media profiles

- **Backend**: Netlify Functions (serverless API)

- **Database**: Neon PostgreSQL (3GB free, always-on)- **File Uploads**: Support for video file uploads with size limits- **Modern UI**: Clean, professional design with smooth animations

- **Authentication**: JWT with bcrypt password hashing

- **Cost**: **$0/month** within generous free tiers- **Church Information**: Contact details, service times, and about section



## 📋 Setup Instructions## Quick Start



### 1. Set Up Neon Database (3 minutes)### Admin Panel

1. Create account at [neon.tech](https://neon.tech)

2. Create new project: `grace-church-db`### Prerequisites- **Secure Login**: Username/password authentication with session management

3. Run the SQL from `database/neon-schema.sql` in SQL Editor

4. Copy your connection string- Node.js 16+ and npm 8+- **Video Management**: Upload videos or add YouTube links



### 2. Deploy to Netlify (5 minutes)- **Content Control**: Manage current featured video and video library

1. Fork this repository

2. Connect to Netlify from GitHub### Installation- **Social Media Management**: Update social media links

3. Set build settings:

   - **Build command**: (leave empty)- **Church Settings**: Update church information and contact details

   - **Publish directory**: `.`

   - **Functions directory**: `netlify/functions`1. **Clone and Setup**- **Dashboard**: Overview of content and statistics



### 3. Environment Variables   ```bash

Add these in Netlify Dashboard → Site Settings → Environment Variables:

   git clone https://github.com/colecoombs/church_project.git## Installation & Development Setup

```bash

NODE_ENV=production   cd church_project

JWT_SECRET=your-super-secure-64-character-random-string

JWT_REFRESH_SECRET=another-super-secure-64-character-random-string   npm install### For Development Testing

DATABASE_URL=your-neon-connection-string-here

```   ```



### 4. Default Login**⚠️ Important: This website requires a local web server to function properly. You cannot simply open the HTML files directly in a browser.**

- **Username**: `admin`

- **Password**: `churchadmin123`2. **Environment Configuration**



**⚠️ Change the default password immediately after first login!**   ```bash#### Quick Start Commands:



## 📁 Project Structure   cp .env.example .env



```   # Edit .env and change JWT secrets for production**Option 1: Python HTTP Server**

church_project/

├── index.html              # Main homepage   ``````bash

├── css/

│   └── styles.css          # All stylingcd church_project

├── js/

│   └── main.js             # Frontend JavaScript3. **Start Development Server**python -m http.server 8000

├── admin/

│   ├── login.html          # Admin login page   ```bash# Access at: http://localhost:8000

│   └── dashboard.html      # Admin dashboard

├── netlify/   npm run dev```

│   ├── functions/          # Serverless backend

│   │   ├── auth-login.js   # Authentication   ```

│   │   ├── videos.js       # Video management

│   │   ├── settings.js     # Church settings**Option 2: Node.js HTTP Server**

│   │   └── contact.js      # Contact form

│   └── netlify.toml        # Netlify configuration4. **Access Your Website**```bash

└── database/

    └── neon-schema.sql     # Database schema   - Main Website: http://localhost:3001npm install -g http-server

```

   - Admin Panel: http://localhost:3001/admin/login.htmlcd church_project

## 🔐 Security Features

http-server -p 8000

- JWT authentication with HTTP-only cookies

- bcrypt password hashing (cost: 12)### Default Admin Credentials# Access at: http://localhost:8000

- Input validation and sanitization

- CORS protection- **Username**: `admin` **Password**: `church2025````

- Security headers (CSP, XSS protection)

- SQL injection prevention with parameterized queries- **Username**: `pastor` **Password**: `grace123`



## 💰 Cost Breakdown**Option 3: PHP Built-in Server**



**$0/month** - Completely free within generous limits:⚠️ **Change these passwords immediately after setup!**```bash



| Service | Free Tier | Usage Limits |cd church_project

|---------|-----------|--------------|

| **Netlify** | Static hosting + Functions | 100GB bandwidth, 125k function calls |## Project Structurephp -S localhost:8000

| **Neon** | PostgreSQL database | 3GB storage, always-on, never pauses |

| **Domain** | Netlify subdomain | Free HTTPS included |# Access at: http://localhost:8000



## 📚 Admin Features``````



- **User Management**: Secure login systemchurch_project/

- **Video Management**: Add/remove YouTube videos

- **Church Settings**: Update contact info, service times├── server/                     # Backend server**Option 4: VS Code Live Server**

- **Contact Messages**: View form submissions

- **Content Control**: Set featured videos and content│   ├── server.js              # Main server file1. Install "Live Server" extension



## 🌐 Production URLs│   ├── routes/                # API routes2. Right-click `index.html` → "Open with Live Server"



- **Main Site**: `https://your-site.netlify.app`│   ├── middleware/            # Express middleware

- **Admin Login**: `https://your-site.netlify.app/admin/`

- **API Endpoints**: `https://your-site.netlify.app/api/*`│   ├── models/                # Data models### Testing URLs



## 🛠️ Local Development│   └── database/              # Database files- **Main Website:** `http://localhost:8000/index.html`



### Prerequisites├── admin/                     # Admin panel frontend- **Demo Overview:** `http://localhost:8000/demo.html`

- Modern web browser

- Text editor├── css/                       # Stylesheets- **Admin Panel:** `http://localhost:8000/admin/login.html`



### Quick Start├── js/                        # Frontend JavaScript

```bash

git clone https://github.com/colecoombs/church_project.git├── uploads/                   # Uploaded files### For Production Deployment

cd church_project

└── package.json               # Dependencies1. Upload all files to your web server

# Start local server (choose one):

python -m http.server 8000        # Python```2. Ensure proper directory structure is maintained

php -S localhost:8000             # PHP

npx http-server -p 8000           # Node.js3. **CRITICAL:** Implement server-side authentication (see Security section)

```

## Development

Access at: `http://localhost:8000`

## Admin Access

## 🎯 Perfect For

### Available Scripts

- Churches of any size

- Religious organizations  ### Default Admin Credentials:

- Community groups

- Non-profit organizations```bash- **Username**: `admin` **Password**: `church2025`



## 📞 Support & Maintenancenpm run dev          # Start development server with auto-reload- **Username**: `pastor` **Password**: `grace123`



This website is designed to be:npm start            # Start production server

- **Zero maintenance** - No servers to manage

- **Always online** - Reliable hosting infrastructurenpm test             # Run tests⚠️ **Important**: Change these default passwords before deploying to production!

- **Mobile-friendly** - Responsive design

- **Secure** - Professional-grade security```

- **Fast** - Global CDN delivery

## File Structure

## 🔗 Documentation

### API Endpoints

For detailed setup instructions, see:

- [Neon + Netlify Deployment Guide](NEON_DEPLOYMENT.md)```



## 🙏 Built For Churches#### Authenticationchurch_project/



This project was created to provide churches with a professional, reliable website at no cost. Feel free to customize it for your church's specific needs.- `POST /api/auth/login` - User login├── index.html              # Main homepage



---- `POST /api/auth/refresh` - Refresh token├── css/



**Built with ❤️ for church communities everywhere**- `POST /api/auth/logout` - User logout│   └── styles.css          # Main stylesheet

- `GET /api/auth/verify` - Verify session├── js/

│   └── main.js             # Frontend JavaScript

#### Videos├── admin/

- `GET /api/videos` - Get all videos│   ├── login.html          # Admin login page

- `GET /api/videos/current` - Get current video│   ├── dashboard.html      # Admin dashboard

- `POST /api/videos` - Create video (auth required)│   ├── admin-styles.css    # Admin panel styles

- `POST /api/videos/upload` - Upload video file (auth required)│   ├── admin-auth.js       # Authentication system

- `PUT /api/videos/:id/current` - Set as current (auth required)│   └── admin-dashboard.js  # Dashboard functionality

- `DELETE /api/videos/:id` - Delete video (auth required)├── data/

│   └── content.json        # Content data storage

#### Settings├── images/                 # Image assets (add your own)

- `GET /api/settings/public` - Get public settings└── README.md              # This file

- `GET /api/settings` - Get all settings (auth required)```

- `PUT /api/settings/:key` - Update setting (auth required)

## Usage Instructions

## Customization

### For Website Visitors

### Church Information1. Visit the main website (`index.html`)

Login to the admin panel to update:2. Watch the featured video in the hero section

- Church name and description3. Browse previous videos in the "Previous Messages" section

- Service times and contact information4. Click on any video to play it in the main player

- Social media links5. Access social media links in the footer

- Video content

### For Administrators

### Styling

- Main styles: `css/styles.css`#### Logging In

- Admin styles: `admin/admin-styles.css`1. Go to `/admin/login.html`

- Responsive breakpoints and CSS variables included2. Enter your username and password

3. Click "Sign In" to access the dashboard

### Video Management

- Upload video files directly through admin panel#### Managing Videos

- Add YouTube videos by URL1. **Set Current Video**:

- Set featured/current video   - Navigate to "Current Video" section

- Manage video library   - Choose YouTube link or upload a video file

   - Add title and description

## Security Features   - Click "Update Current Video"



- JWT authentication with HTTP-only cookies2. **Add to Video Library**:

- Password hashing with bcrypt (12 rounds)   - Navigate to "Video Library" section

- Rate limiting on API endpoints   - Fill out the "Add New Video" form

- Account lockout after failed login attempts   - Choose video type (YouTube or upload)

- CORS protection with configurable origins   - Set date, title, and description

- Security headers with Helmet.js   - Click "Add to Library"

- Input validation and sanitization

- SQL injection protection3. **Manage Existing Videos**:

   - View all videos in the library list

## Production Deployment   - Click "Make Current" to feature a video

   - Click "Delete" to remove a video

### Environment Variables

```bash#### Updating Social Media

NODE_ENV=production1. Navigate to "Social Media" section

JWT_SECRET=your-super-secret-jwt-key-change-in-production2. Enter URLs for Facebook, Instagram, YouTube, and Twitter

JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production3. Click "Update Social Media Links"

FRONTEND_URL=https://yourdomain.com

PORT=3001#### Church Settings

```1. Navigate to "Settings" section

2. Update church name, phone, address, and email

### Security Checklist3. Click "Update Settings"

- [ ] Change default JWT secrets

- [ ] Update default admin passwords## Customization

- [ ] Configure CORS origins for your domain

- [ ] Set up HTTPS/SSL certificates### Changing Colors and Styling

- [ ] Configure reverse proxy (nginx recommended)Edit the CSS variables in `css/styles.css`:

- [ ] Set up database backups```css

- [ ] Configure monitoring and logging:root {

    --primary-color: #2c3e50;    /* Dark blue */

### Deployment Options    --secondary-color: #3498db;   /* Light blue */

    --accent-color: #e74c3c;      /* Red */

#### VPS/Dedicated Server    /* Add your own colors here */

```bash}

# Install PM2 for process management```

npm install -g pm2

pm2 start server/server.js --name "church-website"### Adding Your Church Logo

pm2 startup1. Add your logo image to the `images/` folder

pm2 save2. Update the logo section in `index.html` and admin pages

```

### Customizing Content

#### Docker- Edit church information in `data/content.json`

```dockerfile- Modify the about section in `index.html`

FROM node:18-alpine- Update service times and contact information

WORKDIR /app

COPY package*.json ./## Browser Compatibility

RUN npm ci --only=production

COPY . .- Chrome 60+

EXPOSE 3001- Firefox 55+

CMD ["npm", "start"]- Safari 12+

```- Edge 79+

- Mobile browsers (iOS Safari, Chrome Mobile)

#### Cloud Platforms

- **Heroku**: Connect GitHub repo and deploy## 🔒 Security & Authentication

- **Railway**: Connect GitHub repo and deploy

- **DigitalOcean**: Use App Platform### Current Security Status: ⚠️ **DEVELOPMENT ONLY**

- **AWS**: Elastic Beanstalk or EC2

**The current authentication system is NOT secure for production use.**

## Troubleshooting

#### Current Implementation:

### Common Issues- **Method:** Client-side session management (localStorage/sessionStorage)

- **Tokens:** Simple JSON objects (NOT JWT)

**Server won't start**- **Password Storage:** Client-side validation (plaintext in JavaScript)

```bash- **Suitable for:** Development, testing, demonstration only

# Check if port is in use

netstat -ano | findstr :3001#### Security Limitations:

# Kill process using the port❌ **NOT Production Ready:**

taskkill /PID <PID> /F- Passwords stored in client-side JavaScript

```- No server-side validation or encryption

- Vulnerable to XSS attacks

**Database errors**- No rate limiting or brute force protection

```bash

# Delete database and restart (development only)#### For Production Use:

rm server/database/church.db✅ **Required Security Measures:**

npm run dev1. **Server-side authentication** with proper JWT tokens

```2. **Password hashing** (bcrypt or similar)

3. **HTTPS/SSL** connections only

**JWT token errors**4. **Rate limiting** and account lockout

- Clear browser cookies and localStorage5. **Input validation** and sanitization

- Check JWT_SECRET is set in .env file6. **CSRF protection** and security headers

7. **Two-factor authentication** (recommended)

## Support

**📋 See `SECURITY.md` for detailed security implementation guidelines.**

For issues and questions:

1. Check the troubleshooting section above## 🚀 Development Commands

2. Review server logs in `server/logs/`

3. Create an issue in the GitHub repository### Starting the Development Server



## License**Python (Recommended)**

```bash

MIT License - see LICENSE file for details.cd church_project

python -m http.server 8000

---# Access at: http://localhost:8000

```

**Grace Community Church Website** - Built with Node.js, Express, and modern web technologies.
**Node.js**
```bash
npm install -g http-server
cd church_project  
http-server -p 8000
```

**PHP**
```bash
cd church_project
php -S localhost:8000
```

### Development URLs
- **Main Website:** http://localhost:8000/index.html
- **Demo Overview:** http://localhost:8000/demo.html  
- **Admin Login:** http://localhost:8000/admin/login.html

### Cross-Browser Testing
```bash
# Windows
start chrome http://localhost:8000
start firefox http://localhost:8000  
start msedge http://localhost:8000

# macOS
open -a "Google Chrome" http://localhost:8000
open -a "Firefox" http://localhost:8000
open -a "Safari" http://localhost:8000
```

### Debugging Commands
```javascript
// Browser console debugging
adminAuth.isLoggedIn()           // Check auth status
adminAuth.getSessionData()       // View session data
churchWebsite.content            // Check content data
localStorage.clear()             // Clear stored data
```

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: Client-side demo (localStorage/sessionStorage)
- **Storage**: JSON file (client-side for demo)  
- **Video Support**: YouTube embed, HTML5 video
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)
- **Security**: Development only - see SECURITY.md for production

## Support

For technical support or questions about using this website:
1. Check the browser console for any error messages
2. Ensure all files are uploaded to the correct directories
3. Verify that JavaScript is enabled in the browser
4. Test admin functions with default credentials first

## License

This project is provided as-is for church use. Feel free to modify and customize for your church's needs.

---

## 🔐 Authentication System Details

### Current Implementation (Development Only)
- **Type**: Client-side session management
- **Storage**: localStorage (remember me) / sessionStorage (session)
- **Format**: JWT-style tokens (demo structure)
- **Security**: Basic rate limiting simulation
- **Suitable for**: Development, testing, demos

### Authentication Flow
1. **Login**: Username/password validation (client-side)
2. **Session**: JWT-style token created and stored
3. **Validation**: Token expiration and format checking
4. **Logout**: Clear all stored session data

### Files Structure
```
admin/
├── admin-auth.js           # Basic demo authentication
├── enhanced-auth.js        # Enhanced demo with JWT-style
├── production-auth-example.js  # Production implementation example
└── SECURITY.md            # Detailed security guidelines
```

### For Production Deployment
⚠️ **CRITICAL**: Replace the demo authentication system with:
- Server-side JWT token generation and validation
- Proper password hashing (bcrypt)
- HTTP-only cookies for token storage
- CSRF protection and security headers
- Rate limiting and account lockout
- Input validation and sanitization

See `SECURITY.md` and `production-auth-example.js` for detailed implementation guidance.

---

**Built with ❤️ for Grace Community Church**

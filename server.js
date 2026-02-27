const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'church-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const VIDEOS_FILE = path.join(DATA_DIR, 'videos.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Initialize data files if they don't exist
function initializeData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  if (!fs.existsSync(VIDEOS_FILE)) {
    fs.writeFileSync(VIDEOS_FILE, JSON.stringify({
      featured: {
        title: "Welcome to Our Church",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        type: "youtube"
      },
      archived: []
    }, null, 2));
  }

  if (!fs.existsSync(USERS_FILE)) {
    // Default admin user: username: admin, password: admin123
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    fs.writeFileSync(USERS_FILE, JSON.stringify([{
      username: 'admin',
      password: hashedPassword
    }], null, 2));
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
      churchName: "Community Church",
      socialMedia: {
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        youtube: "https://youtube.com"
      }
    }, null, 2));
  }
}

// Helper functions
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// Routes
app.get('/', (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const settings = readJSON(SETTINGS_FILE);
  res.render('index', { videos, settings });
});

app.get('/admin/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin-login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(USERS_FILE);
  
  const user = users.find(u => u.username === username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = username;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin-login', { error: 'Invalid username or password' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin/dashboard', requireAuth, (req, res) => {
  const videos = readJSON(VIDEOS_FILE);
  const settings = readJSON(SETTINGS_FILE);
  res.render('admin-dashboard', { videos, settings, user: req.session.user });
});

// API Routes
app.post('/api/video/featured', requireAuth, (req, res) => {
  const { title, url, type } = req.body;
  const videos = readJSON(VIDEOS_FILE);
  
  videos.featured = { title, url, type };
  writeJSON(VIDEOS_FILE, videos);
  
  res.json({ success: true });
});

app.post('/api/video/archived', requireAuth, (req, res) => {
  const { title, url, type } = req.body;
  const videos = readJSON(VIDEOS_FILE);
  
  videos.archived.unshift({ 
    id: Date.now(),
    title, 
    url, 
    type,
    date: new Date().toISOString()
  });
  
  writeJSON(VIDEOS_FILE, videos);
  res.json({ success: true });
});

app.delete('/api/video/archived/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const videos = readJSON(VIDEOS_FILE);
  
  videos.archived = videos.archived.filter(v => v.id !== id);
  writeJSON(VIDEOS_FILE, videos);
  
  res.json({ success: true });
});

app.post('/api/settings', requireAuth, (req, res) => {
  const settings = req.body;
  writeJSON(SETTINGS_FILE, settings);
  res.json({ success: true });
});

// Initialize and start server
initializeData();

app.listen(PORT, () => {
  console.log(`Church website running on http://localhost:${PORT}`);
  console.log('Default admin credentials - username: admin, password: admin123');
});

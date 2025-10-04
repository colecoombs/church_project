# Church Website

A modern, responsive website for churches featuring video management, social media integration, and an admin dashboard.

## Features

- 🎥 **Video Player**: Main area to feature the latest sermon or message (YouTube or direct video links)
- 📚 **Video Archive**: Display and manage previous videos
- 🔗 **Social Media Integration**: Links to church social media accounts (Facebook, Twitter, Instagram, YouTube)
- 🔐 **Admin Dashboard**: Secure login area to manage content
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Installation

1. Clone the repository:
```bash
git clone https://github.com/colecoombs/church_project.git
cd church_project
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Public Website
- Visit the home page to watch the featured video
- Scroll down to see previous messages
- Connect with the church via social media links

### Admin Dashboard
1. Navigate to `/admin/login`
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. From the dashboard you can:
   - Update the featured video
   - Add new videos to the archive
   - Remove videos from the archive
   - Update church name and social media links

**⚠️ Important**: Change the default admin password after first login by editing the `data/users.json` file with a new hashed password.

## Project Structure

```
church_project/
├── public/              # Static files
│   ├── css/
│   │   └── styles.css   # Main stylesheet
│   └── js/
│       └── admin.js     # Admin dashboard JavaScript
├── views/               # EJS templates
│   ├── index.ejs        # Home page
│   ├── admin-login.ejs  # Admin login page
│   └── admin-dashboard.ejs  # Admin dashboard
├── data/                # JSON data storage (created on first run)
│   ├── videos.json      # Video data
│   ├── users.json       # User credentials
│   └── settings.json    # Church settings
├── server.js            # Express server
├── package.json         # Dependencies
└── README.md            # This file
```

## Configuration

### Adding Videos
For YouTube videos:
- **Featured Video**: Use the embed URL format: `https://www.youtube.com/embed/VIDEO_ID`
- **Archived Videos**: Use the watch URL format: `https://www.youtube.com/watch?v=VIDEO_ID`

For direct video links:
- Use any direct MP4 video URL

### Changing Admin Password
1. Edit `data/users.json`
2. Replace the password hash with a new one generated using bcrypt
3. Or use the default credentials and update the file through code

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: EJS, HTML5, CSS3, JavaScript
- **Authentication**: bcryptjs, express-session
- **Icons**: Font Awesome
- **Storage**: JSON file-based storage

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please open an issue on GitHub.

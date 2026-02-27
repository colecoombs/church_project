# Quik Church Website

Modern church website with a public-facing site, admin dashboard, Netlify Functions API, and Neon PostgreSQL storage.

## Project Status

This project is **feature-complete for launch**.

Remaining work is mainly content/branding handoff items for the client:
- Final church name / wording
- Final social links
- Final contact details
- Final video content

## What’s Included

### Public Site
- Responsive homepage with hero section and current featured video
- Previous message/video grid
- About section
- Contact form submission to database
- Footer + social links loaded from settings

### Admin Panel
- Secure login (JWT + cookie-based session)
- Current featured video management
- Video library add/delete
- Social links management
- Basic church settings management (name, phone, email)
- Contact submission inbox (new/read/delete)

### Backend (Netlify Functions)
- Authentication: `auth-login`, `auth-verify`
- Content: `videos`, `settings`
- Contact: `contact`, `contacts`
- PostgreSQL via Neon (`pg`)

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Netlify Functions (Node.js)
- Database: Neon PostgreSQL
- Auth: `jsonwebtoken`, `bcryptjs`
- Hosting: Netlify

## Current Limitations / Notes

- Video **file upload UI exists**, but server-side upload/storage is not implemented; YouTube links are the primary supported path.
- Local static server is useful for UI checks, but Netlify Functions require Netlify dev/runtime for full API behavior.
- Some default text in templates still references placeholder branding and should be updated in admin settings or page copy before launch.

## Project Structure

```text
church_project/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── admin-auth.js
│   ├── admin-dashboard.js
│   └── admin-styles.css
├── netlify/
│   └── functions/
│       ├── auth-login.js
│       ├── auth-verify.js
│       ├── contact.js
│       ├── contacts.js
│       ├── settings.js
│       ├── videos.js
│       └── utils/
│           └── auth-middleware.js
├── database/
│   └── neon-schema.sql
├── netlify.toml
└── package.json
```

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Quick static preview (frontend only)

```bash
npm run dev
```

Then open:
- Main site: `http://localhost:8000`
- Admin login page: `http://localhost:8000/admin/login.html`

### 3) Full local dev with functions (recommended)

Use Netlify CLI so function routes resolve locally:

```bash
npx netlify dev
```

## Environment Variables

Set these for Netlify (and local function runtime):

```bash
NODE_ENV=production
JWT_SECRET=replace-with-strong-random-secret
JWT_REFRESH_SECRET=replace-with-strong-random-secret
DATABASE_URL=postgresql://...
```

## Database Setup (Neon)

1. Create a Neon PostgreSQL project.
2. Run the schema in `database/neon-schema.sql`.
3. Add the Neon connection string as `DATABASE_URL`.

## Deploy (Netlify)

This repo is configured for Netlify with:
- Publish directory: `.`
- Functions directory: `netlify/functions`
- API redirects in `netlify.toml`

Deploy by connecting the GitHub repo to Netlify and adding environment variables in site settings.

## Default Admin Credentials

From the seed SQL:
- Username: `admin`
- Password: `churchadmin123`

**Change this password immediately after deployment.**

## Handoff Checklist (Client Content Pass)

- Update church name and final copy
- Update phone/email
- Update social links
- Set featured/current video
- Add full message library
- Verify contact form submissions in admin
- Confirm admin password has been changed

## Client Launch Notes (Copy/Paste)

Use this message for final client handoff:

"The website is complete and ready for launch. We only need your final content updates:
- Official church name and any wording changes
- Final social media URLs
- Final contact info (phone/email)
- Final featured video + additional video library links

After these are confirmed, we will publish with your final branding and content."

## License

MIT — see `LICENSE`.

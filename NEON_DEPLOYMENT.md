# Neon + Netlify Deployment Guide

This guide matches the current project implementation in this repository.

## Architecture

- Static frontend served by Netlify
- Serverless API via Netlify Functions (`netlify/functions`)
- Neon PostgreSQL as the primary data store

## 1) Create Neon Database

1. Create a project at https://neon.tech.
2. Open the SQL editor and run [database/neon-schema.sql](database/neon-schema.sql).
3. Copy your connection string (PostgreSQL URI).

## 2) Configure Environment Variables

Set these in Netlify Site Settings → Environment Variables:

```bash
NODE_ENV=production
JWT_SECRET=replace-with-strong-random-secret
JWT_REFRESH_SECRET=replace-with-strong-random-secret
DATABASE_URL=postgresql://...
```

Notes:
- `DATABASE_URL` must be your Neon connection string.
- Use long random values for both JWT secrets.

## 3) Deploy to Netlify

1. Connect this GitHub repo in Netlify.
2. Use the existing repo config:
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
3. Confirm redirects/headers in [netlify.toml](netlify.toml).
4. Trigger deploy.

## 4) Validate After Deploy

Public site checks:
- Homepage loads
- Current featured video renders
- Video library renders
- Contact form submits successfully

Admin checks:
- Login page loads at `/admin/login.html`
- Login succeeds
- Can add/delete videos
- Can update settings/social links
- Contact submissions appear in admin inbox

## 5) Default Admin Credentials

Seeded by [database/neon-schema.sql](database/neon-schema.sql):
- Username: `admin`
- Password: `churchadmin123`

Change the password immediately after first login.

## Current Known Behavior

- YouTube-based video management is fully supported.
- Upload-style video UI exists in admin, but server-side file storage/upload is not implemented.
- Local `npm run dev` is useful for static preview; use `netlify dev` to test serverless endpoints locally.

## Local Function Testing (Optional)

```bash
npm install
npx netlify dev
```

This runs the site and functions together in a local Netlify runtime.

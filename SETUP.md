# Production Setup Guide

This guide will walk you through setting up RadiologyAI for production use.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Groq AI account (optional, for AI features)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 3. Get Supabase Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

### 4. Set Up Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **"New query"**
3. Open `scripts/01-complete-schema.sql` in your code editor
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

### 5. Create Environment Variables File

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values:

```env
# Supabase (from Step 3)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# NextAuth Secret (generate a new one)
# Run this command: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET=paste-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Groq AI (optional)
GROQ_API_KEY=your-key-here
```

### 6. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

### 7. Start Development Server

```bash
npm run dev
```

### 8. Create Your First Account

1. Open http://localhost:3000
2. Click **"Create account"**
3. Fill in:
   - Full name
   - Work email
   - Department
   - Password (minimum 8 characters)
4. Click **"Create account"**
5. You'll be redirected to the login page
6. Sign in with your new credentials

### 9. Create an Admin User

You have two options:

#### Option A: Direct Database Insert (Recommended for first admin)

1. Go to Supabase → SQL Editor
2. First, generate a password hash. You can use an online bcrypt tool or this Node.js script:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('your-secure-password', 12).then(hash => console.log(hash));
```

3. Insert the admin user:

```sql
INSERT INTO users (email, full_name, role, department, password_hash, is_active)
VALUES (
  'admin@yourhospital.com',
  'System Administrator',
  'admin',
  'IT',
  '$2a$12$your-hashed-password-here',
  true
);
```

4. Sign in with the admin credentials

#### Option B: Using Admin Panel (if you already have admin access)

1. Sign in as an existing admin
2. Go to **Users** in navigation
3. Click **Add User**
4. Create a new user with role "admin"

## Verification Checklist

- [ ] Development server starts without errors
- [ ] Can access homepage at http://localhost:3000
- [ ] Can create a new account via signup
- [ ] Can sign in with created account
- [ ] Dashboard loads and shows data
- [ ] Admin panel accessible (if admin user exists)

## Next Steps

- [ ] Review and customize database RLS policies if needed
- [ ] Set up production environment variables
- [ ] Configure deployment (Vercel recommended)
- [ ] Set up monitoring and error tracking
- [ ] Configure email notifications (if needed)

## Common Issues

### "Supabase client not initialized"
- Check that all Supabase environment variables are set in `.env.local`
- Restart the dev server after adding variables

### "Error creating user" or duplicate email
- Verify the database schema was applied correctly
- Check that the `users` table exists in Supabase
- Ensure email is unique

### Authentication not working
- Verify `NEXTAUTH_SECRET` is set and is a valid base64 string
- Check that `NEXTAUTH_URL` matches your current URL
- Ensure Supabase credentials are correct

## Production Deployment

When deploying to production:

1. **Generate a new `NEXTAUTH_SECRET`** (don't reuse dev secret)
2. **Set `NEXTAUTH_URL`** to your production domain
3. **Review Supabase RLS policies** for production security
4. **Enable Supabase backups** in project settings
5. **Set up monitoring** for errors and performance


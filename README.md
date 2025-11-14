# RadiologyAI - Production-Ready Medical AI Analysis Platform

A production-ready AI-powered platform for analyzing radiology reports, detecting false findings, and improving diagnostic accuracy in healthcare settings.

## 🚀 Features

- **AI-Powered Analysis**: Advanced machine learning for medical report analysis
- **False Finding Detection**: Identify potential false positives and negatives
- **Multi-User Support**: Role-based access control (Admin, Radiologist, Reviewer, Resident)
- **Real-Time Processing**: Fast analysis with instant results
- **Comprehensive Dashboard**: Analytics and reporting capabilities
- **Secure Authentication**: Production-ready Supabase-backed authentication with bcrypt password hashing
- **User Management**: Admin panel for user creation and role management

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI Integration**: Groq AI (LLaMA models)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with Supabase backend
- **Password Security**: bcryptjs with salt rounds
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before setting up the project, ensure you have:

- Node.js 18+ installed
- A Supabase account and project (required)
- A Groq AI account and API key (optional, for AI features)
- Git installed

## 🔧 Quick Start Guide

### Step 1: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 2: Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** in your Supabase dashboard
3. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Fill in your environment variables in `.env.local`:
   \`\`\`env
   # Supabase (REQUIRED)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # NextAuth (REQUIRED)
   # Generate a secret: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   NEXTAUTH_SECRET=your-generated-secret-here
   NEXTAUTH_URL=http://localhost:3000

   # Groq AI (Optional)
   GROQ_API_KEY=your-groq-api-key
   \`\`\`

### Step 4: Set Up Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `scripts/01-complete-schema.sql`
4. Click **Run** to create all tables, indexes, and triggers

### Step 5: Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

### Step 6: Create Your First Account

1. Click **"Create account"** on the homepage
2. Fill in your details (email, name, department, password)
3. Your account will be created with the **radiologist** role by default
4. Sign in with your new credentials

### Step 7: Create an Admin User (Optional)

To create an admin user, you can either:

**Option A: Using Supabase SQL Editor**
\`\`\`sql
-- First, hash a password (use bcrypt or an online tool)
-- Then insert the admin user:
INSERT INTO users (email, full_name, role, department, password_hash, is_active)
VALUES (
  'admin@yourhospital.com',
  'System Administrator',
  'admin',
  'IT',
  '$2a$12$your-hashed-password-here',
  true
);
\`\`\`

**Option B: Using the Admin Panel** (if you already have admin access)
1. Sign in as an admin
2. Go to **Users** in the navigation
3. Click **Add User** and create a new admin account

## 📁 Project Structure

\`\`\`
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── admin/              # Admin user management
│   │   └── dashboard/          # Dashboard analytics
│   ├── admin/                  # Admin pages
│   ├── login/                  # Sign in page
│   ├── signup/                 # Registration page
│   ├── dashboard/              # Main dashboard
│   └── page.tsx                # Landing page
├── components/                 # Reusable UI components
├── lib/
│   ├── auth.ts                # Authentication & password hashing
│   ├── database.ts             # Database service layer
│   ├── supabase.ts            # Supabase client configuration
│   └── medical-ai-engine.ts   # AI analysis engine
├── scripts/
│   ├── 01-complete-schema.sql  # Database schema (REQUIRED)
│   └── 02-comprehensive-seed.sql # Optional seed data
└── types/
    └── next-auth.d.ts          # TypeScript auth types
\`\`\`

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. **Add all environment variables** in Vercel dashboard (Settings → Environment Variables)
4. Deploy automatically

### Required Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET` (generate a new one for production!)
- `NEXTAUTH_URL` (your production domain, e.g., `https://your-app.vercel.app`)
- `GROQ_API_KEY` (if using AI features)

## 🔒 Security Best Practices

- **Never commit** `.env.local` or `.env` files to version control
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access
- Use a strong, randomly generated `NEXTAUTH_SECRET` (32+ bytes)
- Enable Row Level Security (RLS) in Supabase (already configured in schema)
- Review and adjust database policies for your specific use case
- Use HTTPS in production
- Regularly update dependencies for security patches

## 🐛 Troubleshooting

### "Supabase environment variables are not configured"
- Make sure `.env.local` exists and contains all required Supabase variables
- Restart your dev server after adding environment variables

### "Cannot create user" or authentication errors
- Verify your Supabase database schema is set up correctly
- Check that the `users` table exists and has the correct structure
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct

### Database connection issues
- Verify your Supabase project is active
- Check that your IP is allowed (if using IP restrictions)
- Ensure the SQL schema has been executed successfully

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions:
- Check that all environment variables are set correctly
- Verify the database schema is applied
- Review the browser console and server logs for errors
- Ensure Supabase project is active and accessible

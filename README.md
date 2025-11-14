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
- **Password Security**: bcryptjs with salt rounds (12 rounds)
- **Build System**: Lazy environment variable loading for seamless Vercel deployments
- **Deployment**: Vercel-ready with optimized build process

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
│   ├── supabase.ts            # Supabase client configuration (with lazy initialization)
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

**Note**: This project uses lazy Supabase initialization, which means the build will succeed even if environment variables are not present during the build phase. However, you must set all required environment variables in Vercel for the application to function correctly at runtime.

### Required Environment Variables for Production

Make sure to set these in your Vercel project settings:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (preferred) OR `NEXT_PUBLIC_SUPABASE_ANON_KEY` as fallback
- `NEXTAUTH_SECRET` - Generate a new one for production using: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `NEXTAUTH_URL` - Your production domain (e.g., `https://your-app.vercel.app`)

**Optional:**
- `GROQ_API_KEY` - Required only if using AI analysis features

## 🔒 Security Best Practices

- **Never commit** `.env.local` or `.env` files to version control
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secret - it has admin access
- Use a strong, randomly generated `NEXTAUTH_SECRET` (32+ bytes)
- Enable Row Level Security (RLS) in Supabase (already configured in schema)
- Review and adjust database policies for your specific use case
- Use HTTPS in production
- Regularly update dependencies for security patches

## 🐛 Troubleshooting

### Build Issues

**"Build fails on Vercel"**
- The project now uses lazy Supabase initialization, so builds should succeed even without env vars
- If build still fails, check for TypeScript errors: `npm run build` locally
- Ensure all dependencies are installed: `npm install`

**"TypeScript errors during build"**
- All TypeScript errors have been resolved in the latest version
- Run `npm run build` locally to verify before pushing
- Check that you're using Node.js 18+ and the latest npm/pnpm

### Runtime Issues

**"Supabase environment variables are not configured"**
- Make sure `.env.local` exists and contains all required Supabase variables
- Restart your dev server after adding environment variables
- In production (Vercel), verify all env vars are set in project settings

**"Cannot create user" or authentication errors**
- Verify your Supabase database schema is set up correctly
- Check that the `users` table exists and has the correct structure
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct (or `NEXT_PUBLIC_SUPABASE_ANON_KEY` if using fallback)
- Check server logs for detailed error messages

**"500 Internal Server Error" on API routes**
- Check Vercel function logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure Supabase project is active and accessible
- Check that the database schema has been applied

### Database connection issues
- Verify your Supabase project is active
- Check that your IP is allowed (if using IP restrictions)
- Ensure the SQL schema has been executed successfully
- Test connection using the `/api/test/database` endpoint

## 📄 License

This project is licensed under the MIT License.

## ✨ Recent Improvements

- **Lazy Supabase Initialization**: Environment variables are now loaded at runtime, preventing build failures
- **TypeScript Fixes**: All type errors resolved for seamless builds
- **Enhanced Error Handling**: Better error messages for missing environment variables
- **Build Optimization**: Improved build process for Vercel deployments
- **Type Safety**: Added runtime validation for user roles and session data

## 🆘 Support

For issues or questions:
- Check that all environment variables are set correctly
- Verify the database schema is applied
- Review the browser console and server logs for errors
- Ensure Supabase project is active and accessible
- Test database connection: Visit `/api/test/database` endpoint
- Check Vercel function logs for detailed error messages

## 📝 Development Notes

### Environment Variable Loading

This project uses lazy initialization for Supabase clients to prevent build-time failures. The `getSupabaseForServer()` function in `lib/supabase.ts` creates clients only when needed at runtime, not during module import.

### Type Safety

- All user roles are validated at runtime using type guards
- Session data includes proper null checks
- Database queries use proper TypeScript types

### Testing Locally

Before deploying, always test locally:
```bash
npm install
npm run build
npm run dev
```

Visit `http://localhost:3000` and test key features:
- User registration
- User login
- Admin user management (if admin account exists)
- Dashboard access

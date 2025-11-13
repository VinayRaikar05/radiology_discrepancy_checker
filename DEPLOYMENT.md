# Vercel Deployment Guide

This guide will walk you through deploying RadiologyAI to Vercel.

## Prerequisites

- [ ] GitHub account
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Supabase project set up and configured
- [ ] Code pushed to a GitHub repository

## Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Production ready RadiologyAI"

# Create a repository on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository containing your code
5. Click **"Import"**

## Step 3: Configure Project Settings

Vercel will auto-detect Next.js. Keep the default settings:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

## Step 4: Add Environment Variables

**⚠️ CRITICAL: Do this before deploying!**

Click **"Environment Variables"** and add each of these:

### Required Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`
   - Environment: Production, Preview, Development (check all)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon public key
   - Environment: Production, Preview, Development (check all)

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service_role key
   - ⚠️ Keep this secret!
   - Environment: Production, Preview, Development (check all)

4. **NEXTAUTH_SECRET**
   - Value: Generate a NEW secret for production (don't reuse dev secret!)
   - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - Environment: Production, Preview, Development (check all)

5. **NEXTAUTH_URL**
   - Value: Your Vercel deployment URL (will be `https://your-app.vercel.app`)
   - You can update this after first deployment if needed
   - Environment: Production, Preview, Development (check all)

### Optional Variables

6. **GROQ_API_KEY** (if using AI features)
   - Value: Your Groq API key
   - Environment: Production, Preview, Development (check all)

## Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-5 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

## Step 6: Update NEXTAUTH_URL (if needed)

After deployment:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Find `NEXTAUTH_URL`
4. Update it to your actual deployment URL: `https://your-app-name.vercel.app`
5. Redeploy (or it will update on next push)

## Step 7: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` to your custom domain

## Step 8: Verify Deployment

1. Visit your deployment URL
2. Test signup functionality
3. Test login functionality
4. Verify dashboard loads correctly
5. Check that database connections work

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] `NEXTAUTH_URL` matches your deployment URL
- [ ] Database schema is applied in Supabase
- [ ] Can create new accounts
- [ ] Can sign in with created accounts
- [ ] Dashboard loads and shows data
- [ ] Admin panel works (if admin user exists)

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18+ by default)

### Environment Variables Not Working

- Make sure variables are added for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Authentication Errors

- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set and is a valid base64 string
- Check Supabase credentials are correct

### Database Connection Issues

- Verify Supabase project is active
- Check that database schema is applied
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is correct
- Review Supabase logs for connection errors

## Continuous Deployment

Vercel automatically deploys on every push to your main branch:

1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically builds and deploys
4. Preview deployments are created for pull requests

## Environment-Specific Deployments

You can set different environment variables for:
- **Production**: Your main deployment
- **Preview**: Pull request previews
- **Development**: Local development (usually not used)

Set variables for all environments unless you need different values.

## Monitoring

- **Vercel Analytics**: Enable in project settings
- **Error Tracking**: Consider adding Sentry or similar
- **Logs**: View in Vercel dashboard under "Logs"

## Security Best Practices

1. **Never commit** `.env.local` or `.env` files
2. **Rotate secrets** periodically
3. **Use different secrets** for production vs development
4. **Enable Vercel's security features** (DDoS protection, etc.)
5. **Review Supabase RLS policies** for production security

## Cost Considerations

- **Vercel**: Free tier includes generous limits
- **Supabase**: Free tier available, upgrade as needed
- **Groq AI**: Check pricing for API usage

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase logs
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly


# SMTP Email Configuration Guide

This guide explains how to configure SMTP (Simple Mail Transfer Protocol) settings for email notifications in RadiologyAI.

## 📋 Required Environment Variables

Add these variables to your `.env.local` file (for local development) or your deployment platform's environment variables (for production):

```env
# SMTP Configuration (Required for email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com
```

### Variable Descriptions

- **SMTP_HOST**: Your email provider's SMTP server address
- **SMTP_PORT**: SMTP port (usually 587 for TLS or 465 for SSL)
- **SMTP_USER**: Your email address or SMTP username
- **SMTP_PASSWORD**: Your email password or app-specific password
- **SMTP_FROM**: The "from" email address (optional, defaults to SMTP_USER)

## 🔧 Setup Instructions

### Step 1: Create/Edit `.env.local` File

1. Navigate to your project root directory
2. Create a file named `.env.local` (if it doesn't exist)
3. Add the SMTP configuration variables

**Example `.env.local` file:**

```env
# Existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your-groq-key

# SMTP Configuration (add these)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Step 2: Restart Development Server

After adding environment variables, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 📧 Email Provider Configurations

### Gmail Setup

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this 16-character password (not your regular Gmail password)

3. **Add to `.env.local`**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
```

### Outlook/Microsoft 365 Setup

1. **Enable SMTP AUTH** in your Microsoft 365 admin center
2. **Use your Microsoft account email and password**

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-microsoft-password
SMTP_FROM=your-email@outlook.com
```

### SendGrid Setup

1. **Create a SendGrid account** at [sendgrid.com](https://sendgrid.com)
2. **Create an API Key**:
   - Settings → API Keys → Create API Key
   - Give it "Mail Send" permissions

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=your-verified-sender@yourdomain.com
```

### Mailgun Setup

1. **Create a Mailgun account** at [mailgun.com](https://mailgun.com)
2. **Get your SMTP credentials** from the dashboard

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_FROM=noreply@yourdomain.com
```

### Amazon SES Setup

1. **Set up Amazon SES** in AWS Console
2. **Verify your email address or domain**
3. **Create SMTP credentials**

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM=verified-email@yourdomain.com
```

### Custom SMTP Server

For your own SMTP server or other providers:

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

**Common Ports:**
- `587` - TLS/STARTTLS (recommended)
- `465` - SSL (secure)
- `25` - Unencrypted (not recommended)

## 🚀 Production Deployment

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add each SMTP variable:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM` (optional)
4. Select the environment (Production, Preview, Development)
5. Redeploy your application

### Other Platforms

For other deployment platforms (Netlify, Railway, etc.):
- Add the same environment variables in your platform's settings
- Restart/redeploy your application after adding variables

## ✅ Testing Email Configuration

### Option 1: Test via Code

Create a test API route to verify email works:

```typescript
// app/api/test/email/route.ts
import { NextResponse } from "next/server"
import { notificationService } from "@/lib/notifications"

export async function GET() {
  try {
    const result = await notificationService.sendEmail({
      to: "test@example.com",
      subject: "Test Email",
      html: "<h1>Test Email</h1><p>This is a test email from RadiologyAI.</p>",
    })

    return NextResponse.json({
      success: result,
      message: result ? "Email sent successfully" : "Email configuration missing or failed",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
```

Then visit: `http://localhost:3000/api/test/email`

### Option 2: Check Logs

When email is not configured, you'll see this warning in your server logs:
```
Email not configured. Skipping email notification.
```

When email is configured but fails, you'll see:
```
Email send error: [error details]
```

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use App Passwords** instead of your main email password (especially for Gmail)
3. **Use environment-specific credentials** (different for dev/staging/production)
4. **Rotate passwords regularly**
5. **Use dedicated email accounts** for application emails (not personal accounts)
6. **Enable SPF/DKIM records** for your domain to improve deliverability

## 🐛 Troubleshooting

### "Email not configured" Warning

- **Check**: All SMTP variables are set in `.env.local`
- **Solution**: Ensure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` are all present
- **Restart**: Restart your dev server after adding variables

### "Authentication failed" Error

- **Gmail**: Make sure you're using an App Password, not your regular password
- **Check**: Username and password are correct
- **Verify**: SMTP AUTH is enabled for your email provider

### "Connection timeout" Error

- **Check**: SMTP_HOST and SMTP_PORT are correct
- **Firewall**: Ensure port 587 or 465 is not blocked
- **Network**: Check if you're behind a corporate firewall

### Emails Not Sending

- **Check server logs** for detailed error messages
- **Verify**: Email address format is correct
- **Test**: Use the test endpoint to isolate the issue
- **Provider limits**: Check if you've hit sending rate limits

## 📝 Example Complete `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# NextAuth Configuration
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000

# Groq AI (Optional)
GROQ_API_KEY=your-groq-api-key

# SMTP Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
SMTP_FROM=noreply@yourdomain.com
```

## 🎯 Next Steps

After configuring SMTP:

1. ✅ Test email sending with the test endpoint
2. ✅ Verify emails are received (check spam folder)
3. ✅ Configure email templates if needed
4. ✅ Set up email notifications in your application workflows

Email notifications will automatically work for:
- Report flagged notifications
- Analysis complete notifications
- User welcome emails

The system will gracefully handle missing SMTP configuration - notifications will be skipped with a warning instead of breaking the application.


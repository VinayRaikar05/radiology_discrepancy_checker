# Quick SMTP Setup Guide

## 🚀 Quick Start

### 1. Create `.env.local` file in project root

```bash
# In your project root directory
touch .env.local
```

### 2. Add SMTP variables to `.env.local`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 3. Restart your dev server

```bash
npm run dev
```

## 📧 Quick Provider Configs

### Gmail (Most Common)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # App Password (16 chars)
SMTP_FROM=your-email@gmail.com
```
**Note:** Must use [App Password](https://myaccount.google.com/apppasswords), not regular password!

### Outlook
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx  # Your SendGrid API key
SMTP_FROM=verified@yourdomain.com
```

## ✅ Test Your Configuration

Visit: `http://localhost:3000/api/test/email?email=your-email@example.com`

(Admin only - must be logged in as admin)

## 📖 Full Documentation

See `SMTP_SETUP.md` for:
- Detailed setup instructions
- Troubleshooting guide
- Security best practices
- Production deployment tips

## ⚠️ Important Notes

1. **Gmail requires App Passwords** - not your regular password
2. **Restart server** after adding environment variables
3. **Optional** - App works without SMTP, just no email notifications
4. **Never commit** `.env.local` to git


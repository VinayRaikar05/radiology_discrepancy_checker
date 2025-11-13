# RadiologyAI - Advanced Medical AI Analysis Platform

A comprehensive AI-powered platform for analyzing radiology reports, detecting false findings, and improving diagnostic accuracy in healthcare settings.

## 🚀 Features

- **AI-Powered Analysis**: Advanced machine learning for medical report analysis
- **False Finding Detection**: Identify potential false positives and negatives
- **Multi-User Support**: Role-based access for different medical professionals
- **Real-Time Processing**: Fast analysis with instant results
- **Comprehensive Dashboard**: Analytics and reporting capabilities
- **Secure Authentication**: Role-based access control

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **AI Integration**: Groq AI (LLaMA models)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom auth with demo accounts
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before setting up the project, ensure you have:

- Node.js 18+ installed
- A Groq AI account and API key
- A Supabase project set up
- Git installed

## 🔧 Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd radiology-ai-platform
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Visit `/setup` in your browser after starting the development server to use the interactive setup guide, or manually create a `.env.local` file:

\`\`\`env
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Authentication Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
\`\`\`

### 4. Set Up Database

Run the SQL scripts in your Supabase SQL editor:

1. Execute `scripts/01-complete-schema.sql` to create tables
2. Execute `scripts/02-comprehensive-seed.sql` to add sample data

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the application.

## 🔑 API Keys Setup

### Groq AI Setup
1. Visit [console.groq.com](https://console.groq.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your environment variables

### Supabase Setup
1. Visit [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and API keys
5. Add them to your environment variables

## 👥 Demo Accounts

The platform includes demo accounts for testing:

- **Admin**: admin@radiologyai.com / password123
- **Radiologist**: dr.sarah.smith@generalhospital.com / password123
- **Reviewer**: dr.michael.johnson@generalhospital.com / password123
- **Resident**: dr.emily.davis@generalhospital.com / password123

## 🧪 Testing the Setup

1. Visit `/setup` to use the interactive configuration tool
2. Test all API connections using the "Test Connections" button
3. Try the AI analysis demo on the homepage
4. Login with demo accounts to explore different user roles

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── setup/             # Interactive setup page
│   ├── login/             # Authentication pages
│   └── page.tsx           # Homepage with demo
├── components/            # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database operations
│   ├── medical-ai-engine.ts # AI analysis engine
│   └── supabase.ts       # Supabase configuration
├── scripts/              # Database setup scripts
└── public/               # Static assets
\`\`\`

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

Make sure to add all environment variables in your Vercel dashboard under Settings → Environment Variables.

## 🔒 Security Notes

- Keep your Supabase service role key secure
- Use strong secrets for NextAuth
- Enable Row Level Security in Supabase
- Review and adjust database policies for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the `/setup` page for configuration help
- Review the demo accounts and test connections
- Ensure all environment variables are properly set

## 🔄 Updates

The platform is actively maintained with regular updates for:
- New AI model integrations
- Enhanced medical analysis capabilities
- Improved user interface
- Security updates

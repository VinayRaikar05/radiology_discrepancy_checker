"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Database,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Zap,
  Cloud,
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SetupGuidePage() {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const markStepComplete = (stepId: string) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: true }))
    toast({
      title: "Step Completed",
      description: "Great! Move on to the next step.",
    })
  }

  const toggleSecretVisibility = (secretId: string) => {
    setShowSecrets((prev) => ({ ...prev, [secretId]: !prev[secretId] }))
  }

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Setup Guide</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/setup">
                <Button variant="outline">Back to Setup</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Setup Progress
            </CardTitle>
            <CardDescription>Follow these steps in order to set up your RadiologyAI project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                {completedSteps.groq ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="font-medium">1. Groq AI Setup</span>
              </div>
              <div className="flex items-center gap-2">
                {completedSteps.supabase ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="font-medium">2. Supabase Setup</span>
              </div>
              <div className="flex items-center gap-2">
                {completedSteps.database ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="font-medium">3. Database Setup</span>
              </div>
              <div className="flex items-center gap-2">
                {completedSteps.deploy ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
                <span className="font-medium">4. Deploy & Test</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="groq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="groq">1. Groq AI</TabsTrigger>
            <TabsTrigger value="supabase">2. Supabase</TabsTrigger>
            <TabsTrigger value="database">3. Database</TabsTrigger>
            <TabsTrigger value="deploy">4. Deploy</TabsTrigger>
          </TabsList>

          {/* Step 1: Groq AI Setup */}
          <TabsContent value="groq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Step 1: Get Groq AI API Key
                  {completedSteps.groq && (
                    <Badge variant="secondary" className="ml-2">
                      ✓ Complete
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Groq provides ultra-fast AI inference for analyzing medical reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What is Groq?</strong> Groq offers the fastest LLM inference in the world, perfect for
                    real-time medical report analysis.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        1
                      </span>
                      Create Groq Account
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>
                        Visit{" "}
                        <a
                          href="https://console.groq.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          console.groq.com <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>Click "Sign Up" in the top right corner</li>
                      <li>Sign up with your email or GitHub account</li>
                      <li>Verify your email address if required</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        2
                      </span>
                      Generate API Key
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>Once logged in, look for "API Keys" in the left sidebar</li>
                      <li>Click "Create API Key" or "New API Key"</li>
                      <li>Give your key a name like "RadiologyAI"</li>
                      <li>Click "Create" and copy the generated key immediately</li>
                      <li>
                        <strong className="text-red-600">Important:</strong> Save this key securely - you won't see it
                        again!
                      </li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        3
                      </span>
                      What Your API Key Looks Like
                    </h4>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <span className={showSecrets.groq ? "" : "blur-sm"}>
                          gsk_1234567890abcdef1234567890abcdef1234567890abcdef
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => toggleSecretVisibility("groq")}>
                          {showSecrets.groq ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      • Starts with "gsk_"
                      <br />• About 50+ characters long
                      <br />• Mix of letters and numbers
                    </p>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Free Tier:</strong> Groq offers generous free usage limits. No credit card required to
                      start!
                    </AlertDescription>
                  </Alert>

                  <Button onClick={() => markStepComplete("groq")} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I've Got My Groq API Key
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Supabase Setup */}
          <TabsContent value="supabase">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Step 2: Set Up Supabase Project
                  {completedSteps.supabase && (
                    <Badge variant="secondary" className="ml-2">
                      ✓ Complete
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Supabase provides PostgreSQL database, authentication, and real-time features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What is Supabase?</strong> An open-source Firebase alternative with PostgreSQL database,
                    built-in auth, and real-time subscriptions.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        1
                      </span>
                      Create Supabase Account
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>
                        Visit{" "}
                        <a
                          href="https://supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          supabase.com <ExternalLink className="h-3 w-3" />
                        </a>
                      </li>
                      <li>Click "Start your project" or "Sign Up"</li>
                      <li>Sign up with GitHub (recommended) or email</li>
                      <li>Verify your email if using email signup</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        2
                      </span>
                      Create New Project
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>Click "New Project" from your dashboard</li>
                      <li>Choose your organization (or create one)</li>
                      <li>
                        <strong>Project Name:</strong> "RadiologyAI" or similar
                      </li>
                      <li>
                        <strong>Database Password:</strong> Generate a strong password and save it!
                      </li>
                      <li>
                        <strong>Region:</strong> Choose closest to your users
                      </li>
                      <li>Click "Create new project"</li>
                      <li>
                        <strong>Wait 2-3 minutes</strong> for project setup to complete
                      </li>
                    </ol>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        3
                      </span>
                      Get Your API Keys
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>
                        Once project is ready, go to <strong>Settings</strong> → <strong>API</strong>
                      </li>
                      <li>You'll see three important values you need to collect</li>
                      <li>
                        <strong>Project URL:</strong> Copy and save this (format: https://your-project-ref.supabase.co)
                      </li>
                      <li>
                        <strong>Anon/Public Key:</strong> A long JWT token starting with "eyJ"
                      </li>
                      <li>
                        <strong>Service_role Key:</strong> Another JWT token with admin privileges (keep this secret!)
                      </li>
                    </ol>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Security Note:</strong> The service_role key has admin privileges. Keep it secret and
                      never expose it in client-side code or version control!
                    </AlertDescription>
                  </Alert>

                  <Button onClick={() => markStepComplete("supabase")} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I've Got My Supabase Keys
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Database Setup */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Step 3: Set Up Database Schema
                  {completedSteps.database && (
                    <Badge variant="secondary" className="ml-2">
                      ✓ Complete
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Create the database tables and configure security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What we're doing:</strong> Creating tables for users, radiology reports, and analysis
                    results with proper security policies.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        1
                      </span>
                      Open SQL Editor
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>In your Supabase project dashboard</li>
                      <li>
                        Click on <strong>"SQL Editor"</strong> in the left sidebar
                      </li>
                      <li>You'll see a code editor where you can run SQL commands</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        2
                      </span>
                      Run Database Schema
                    </h4>
                    <p className="text-sm mb-3 ml-8">Copy this corrected SQL code into the SQL Editor:</p>

                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-96">
                      <pre>{`-- RadiologyAI Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'radiologist', 'reviewer', 'resident')) NOT NULL,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  password_hash TEXT,
  preferences JSONB DEFAULT '{}'
);

-- Radiology reports table
CREATE TABLE IF NOT EXISTS radiology_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  study_type VARCHAR(255) NOT NULL,
  study_date DATE,
  report_text TEXT NOT NULL,
  radiologist_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) CHECK (status IN ('pending', 'reviewed', 'approved', 'flagged')) DEFAULT 'pending',
  priority VARCHAR(50) CHECK (priority IN ('normal', 'high', 'urgent')) DEFAULT 'normal',
  metadata JSONB DEFAULT '{}'
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES radiology_reports(id) ON DELETE CASCADE,
  confidence DECIMAL(5,4) NOT NULL,
  risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  findings TEXT[] NOT NULL,
  potential_false_findings JSONB DEFAULT '[]',
  recommendations TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  medical_relevance_score DECIMAL(5,4) NOT NULL,
  discrepancies JSONB DEFAULT '[]',
  anomalies JSONB DEFAULT '[]',
  processing_time_ms INTEGER DEFAULT 0,
  ai_model_version VARCHAR(100) DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_reports_radiologist ON radiology_reports(radiologist_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON radiology_reports(status);
CREATE INDEX IF NOT EXISTS idx_analysis_report ON analysis_results(report_id);`}</pre>
                    </div>

                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `-- RadiologyAI Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'radiologist', 'reviewer', 'resident')) NOT NULL,
  department VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  password_hash TEXT,
  preferences JSONB DEFAULT '{}'
);

-- Radiology reports table
CREATE TABLE IF NOT EXISTS radiology_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id VARCHAR(255) NOT NULL,
  study_type VARCHAR(255) NOT NULL,
  study_date DATE,
  report_text TEXT NOT NULL,
  radiologist_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) CHECK (status IN ('pending', 'reviewed', 'approved', 'flagged')) DEFAULT 'pending',
  priority VARCHAR(50) CHECK (priority IN ('normal', 'high', 'urgent')) DEFAULT 'normal',
  metadata JSONB DEFAULT '{}'
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES radiology_reports(id) ON DELETE CASCADE,
  confidence DECIMAL(5,4) NOT NULL,
  risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
  findings TEXT[] NOT NULL,
  potential_false_findings JSONB DEFAULT '[]',
  recommendations TEXT[] NOT NULL,
  summary TEXT NOT NULL,
  medical_relevance_score DECIMAL(5,4) NOT NULL,
  discrepancies JSONB DEFAULT '[]',
  anomalies JSONB DEFAULT '[]',
  processing_time_ms INTEGER DEFAULT 0,
  ai_model_version VARCHAR(100) DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_reports_radiologist ON radiology_reports(radiologist_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON radiology_reports(status);
CREATE INDEX IF NOT EXISTS idx_analysis_report ON analysis_results(report_id);`,
                          "Database schema copied to clipboard",
                        )
                      }
                      className="mt-3"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Schema SQL
                    </Button>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        3
                      </span>
                      Add Sample Data
                    </h4>
                    <p className="text-sm mb-3 ml-8">Add some test users with proper UUID casting:</p>

                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-64">
                      <pre>{`-- Sample users for testing
INSERT INTO users (id, email, full_name, role, department) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin@radiologyai.com', 'System Administrator', 'admin', 'IT'),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'dr.smith@hospital.com', 'Dr. Sarah Smith', 'radiologist', 'Radiology'),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'dr.johnson@hospital.com', 'Dr. Michael Johnson', 'reviewer', 'Radiology'),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'resident@hospital.com', 'Dr. Alex Chen', 'resident', 'Radiology')
ON CONFLICT (email) DO NOTHING;`}</pre>
                    </div>

                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `-- Sample users for testing
INSERT INTO users (id, email, full_name, role, department) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin@radiologyai.com', 'System Administrator', 'admin', 'IT'),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'dr.smith@hospital.com', 'Dr. Sarah Smith', 'radiologist', 'Radiology'),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'dr.johnson@hospital.com', 'Dr. Michael Johnson', 'reviewer', 'Radiology'),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'resident@hospital.com', 'Dr. Alex Chen', 'resident', 'Radiology')
ON CONFLICT (email) DO NOTHING;`,
                          "Sample data SQL copied to clipboard",
                        )
                      }
                      className="mt-3"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Sample Data SQL
                    </Button>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        4
                      </span>
                      Run the SQL
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>Paste the schema SQL into the SQL Editor</li>
                      <li>
                        Click <strong>"Run"</strong> button (or press Ctrl+Enter)
                      </li>
                      <li>You should see "Success. No rows returned" message</li>
                      <li>Optionally, run the sample data SQL the same way</li>
                      <li>
                        Check the <strong>"Table Editor"</strong> to see your new tables
                      </li>
                    </ol>
                  </div>

                  <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <strong>UUID Casting Fix:</strong> The corrected version uses <code>::uuid</code> casting to
                      ensure proper data types.
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Verification:</strong> Go to "Table Editor" in the sidebar. You should see three tables:
                      users, radiology_reports, and analysis_results.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={() => markStepComplete("database")} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Database Schema Created Successfully
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: Deploy & Test */}
          <TabsContent value="deploy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  Step 4: Deploy & Test Your Application
                  {completedSteps.deploy && (
                    <Badge variant="secondary" className="ml-2">
                      ✓ Complete
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Set up your environment variables and test the complete system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        1
                      </span>
                      Create Environment File
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>
                        In your project root directory, create a file called{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code>
                      </li>
                      <li>Add the following environment variables with your actual values:</li>
                    </ol>

                    <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-lg mt-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Environment variables needed:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>
                          <code>GROQ_API_KEY</code> - Your Groq API key
                        </li>
                        <li>
                          <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL
                        </li>
                        <li>
                          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key
                        </li>
                        <li>
                          <code>SUPABASE_SERVICE_ROLE_KEY</code> - Your Supabase service role key (keep secret!)
                        </li>
                        <li>
                          <code>NEXTAUTH_SECRET</code> - A random secret for NextAuth
                        </li>
                        <li>
                          <code>NEXTAUTH_URL</code> - Your application URL (http://localhost:3000 for development)
                        </li>
                      </ul>
                    </div>

                    <Link href="/setup">
                      <Button className="mt-3 w-full bg-transparent" variant="outline" size="sm">
                        Go to Setup Page for Template
                      </Button>
                    </Link>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        2
                      </span>
                      Install Dependencies & Start
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>Open terminal in your project directory</li>
                      <li>Install dependencies:</li>
                    </ol>

                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mt-3">npm install</div>

                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8 mt-3" start={3}>
                      <li>Start the development server:</li>
                    </ol>

                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mt-3">npm run dev</div>

                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8 mt-3" start={4}>
                      <li>
                        Open your browser to{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">http://localhost:3000</code>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        3
                      </span>
                      Test Your Setup
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-8">
                      <li>
                        Visit{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">http://localhost:3000/setup</code>
                      </li>
                      <li>Click "Test Connections" to verify all services</li>
                      <li>
                        Go to{" "}
                        <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">http://localhost:3000/login</code>
                      </li>
                      <li>Try logging in with demo accounts</li>
                    </ol>

                    <div className="mt-3 space-y-2">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <strong className="text-sm">Admin Account:</strong>
                        <br />
                        <code className="text-xs">admin@radiologyai.com / admin123</code>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <strong className="text-sm">Radiologist Account:</strong>
                        <br />
                        <code className="text-xs">dr.smith@hospital.com / doctor123</code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        4
                      </span>
                      What to Test
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-8">
                      <li>✅ Login with demo accounts</li>
                      <li>✅ Navigate to dashboard and see statistics</li>
                      <li>✅ Upload a sample radiology report</li>
                      <li>✅ View analysis results</li>
                      <li>✅ Check admin panel (admin account only)</li>
                      <li>✅ Test connection status in setup page</li>
                    </ul>
                  </div>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Production Deployment:</strong> For Vercel deployment, add all environment variables in
                      your Vercel dashboard under Settings → Environment Variables.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-4">
                    <Button onClick={() => markStepComplete("deploy")} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Everything Works!
                    </Button>
                    <Link href="/setup">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Setup Page
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Final Success Message */}
        {Object.values(completedSteps).every(Boolean) && (
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Congratulations!</h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Your RadiologyAI system is fully configured and ready to use!
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                  <Link href="/upload">
                    <Button variant="outline">Upload First Report</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

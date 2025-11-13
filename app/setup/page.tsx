"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  RefreshCw,
  Database,
  Brain,
  Settings,
  BookOpen,
  Download,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

interface TestResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

interface ConnectionTests {
  groq: TestResult | null
  supabase: TestResult | null
  database: TestResult | null
}

export default function SetupPage() {
  const [config, setConfig] = useState({
    groqApiKey: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseServiceKey: "",
    nextAuthSecret: "",
    nextAuthUrl: "",
  })

  const [envContent, setEnvContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<ConnectionTests>({
    groq: null,
    supabase: null,
    database: null,
  })
  const [copied, setCopied] = useState(false)

  // Generate environment file content
  const generateEnvContent = () => {
    const content = `# RadiologyAI Configuration
# Copy this content to your .env.local file

# Groq AI Configuration
GROQ_API_KEY=${config.groqApiKey}

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${config.supabaseServiceKey}

# NextAuth Configuration
NEXTAUTH_SECRET=${config.nextAuthSecret || "your-secret-key-change-in-production"}
NEXTAUTH_URL=${config.nextAuthUrl || "http://localhost:3000"}

# Additional Supabase Keys (auto-generated from main config)
SUPABASE_URL=${config.supabaseUrl}
SUPABASE_ANON_KEY=${config.supabaseAnonKey}
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-settings
`
    setEnvContent(content)
  }

  // Parse environment content back to form fields
  const parseEnvContent = () => {
    const lines = envContent.split("\n")
    const newConfig = { ...config }

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=")
        const value = valueParts.join("=")

        switch (key) {
          case "GROQ_API_KEY":
            newConfig.groqApiKey = value
            break
          case "NEXT_PUBLIC_SUPABASE_URL":
          case "SUPABASE_URL":
            newConfig.supabaseUrl = value
            break
          case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
          case "SUPABASE_ANON_KEY":
            newConfig.supabaseAnonKey = value
            break
          case "SUPABASE_SERVICE_ROLE_KEY":
            newConfig.supabaseServiceKey = value
            break
          case "NEXTAUTH_SECRET":
            newConfig.nextAuthSecret = value
            break
          case "NEXTAUTH_URL":
            newConfig.nextAuthUrl = value
            break
        }
      }
    })

    setConfig(newConfig)
  }

  // Auto-generate env content when config changes
  useEffect(() => {
    if (Object.values(config).some((value) => value.trim() !== "")) {
      generateEnvContent()
    }
  }, [config])

  // Test connections
  const testConnections = async () => {
    setIsTesting(true)
    setTestResults({ groq: null, supabase: null, database: null })

    try {
      // Test Groq
      const groqResponse = await fetch("/api/test/groq")
      const groqResult = await groqResponse.json()
      setTestResults((prev) => ({ ...prev, groq: groqResult }))

      // Test Supabase
      const supabaseResponse = await fetch("/api/test/supabase")
      const supabaseResult = await supabaseResponse.json()
      setTestResults((prev) => ({ ...prev, supabase: supabaseResult }))

      // Test Database
      const databaseResponse = await fetch("/api/test/database")
      const databaseResult = await databaseResponse.json()
      setTestResults((prev) => ({ ...prev, database: databaseResult }))
    } catch (error) {
      console.error("Connection test error:", error)
    } finally {
      setIsTesting(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Reset env content to generated version
  const resetEnvContent = () => {
    generateEnvContent()
  }

  const TestResultBadge = ({ result }: { result: TestResult | null }) => {
    if (!result) {
      return <Badge variant="secondary">Not tested</Badge>
    }

    return result.success ? (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle className="w-3 h-3 mr-1" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Failed
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RadiologyAI Setup</h1>
        <p className="text-muted-foreground">
          Configure your environment variables and test connections to get started.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-semibold">Setup Guide</h3>
                <p className="text-sm text-muted-foreground">Step-by-step instructions</p>
              </div>
            </div>
            <Link href="/setup/guide">
              <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                View Guide
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-semibold">Test Connections</h3>
                <p className="text-sm text-muted-foreground">Verify your setup</p>
              </div>
            </div>
            <Button onClick={testConnections} disabled={isTesting} size="sm" className="w-full mt-2">
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-purple-500" />
              <div>
                <h3 className="font-semibold">Download Config</h3>
                <p className="text-sm text-muted-foreground">Get your .env.local file</p>
              </div>
            </div>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="w-full mt-2 bg-transparent"
              disabled={!envContent.trim()}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Config
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="env-file">Environment File</TabsTrigger>
          <TabsTrigger value="test-results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>API Configuration</span>
              </CardTitle>
              <CardDescription>
                Enter your API keys and service URLs. Visit the setup guide for detailed instructions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groq-key">Groq API Key</Label>
                  <Input
                    id="groq-key"
                    type="password"
                    placeholder="gsk_..."
                    value={config.groqApiKey}
                    onChange={(e) => setConfig((prev) => ({ ...prev, groqApiKey: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    value={config.supabaseUrl}
                    onChange={(e) => setConfig((prev) => ({ ...prev, supabaseUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-anon">Supabase Anon Key</Label>
                  <Input
                    id="supabase-anon"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.supabaseAnonKey}
                    onChange={(e) => setConfig((prev) => ({ ...prev, supabaseAnonKey: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-service">Supabase Service Role Key</Label>
                  <Input
                    id="supabase-service"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.supabaseServiceKey}
                    onChange={(e) => setConfig((prev) => ({ ...prev, supabaseServiceKey: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextauth-secret">NextAuth Secret</Label>
                  <Input
                    id="nextauth-secret"
                    type="password"
                    placeholder="your-secret-key"
                    value={config.nextAuthSecret}
                    onChange={(e) => setConfig((prev) => ({ ...prev, nextAuthSecret: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextauth-url">NextAuth URL</Label>
                  <Input
                    id="nextauth-url"
                    placeholder="http://localhost:3000"
                    value={config.nextAuthUrl}
                    onChange={(e) => setConfig((prev) => ({ ...prev, nextAuthUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env-file" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment File Content</CardTitle>
              <CardDescription>
                Copy this content to your <code>.env.local</code> file, or edit it directly here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All
                    </>
                  )}
                </Button>
                <Button onClick={resetEnvContent} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Generated
                </Button>
                <Button onClick={parseEnvContent} variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Parse & Update
                </Button>
              </div>

              <Textarea
                value={envContent}
                onChange={(e) => setEnvContent(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
                placeholder="Your environment variables will appear here..."
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Never commit your <code>.env.local</code> file to version control. It
                  contains sensitive API keys and secrets.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Connection Test Results</span>
                <Button onClick={testConnections} disabled={isTesting} size="sm">
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test Again
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>Verify that all services are properly configured and accessible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Groq Test */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Groq AI API</h3>
                    <p className="text-sm text-muted-foreground">
                      {testResults.groq?.success
                        ? "AI model connection successful"
                        : testResults.groq?.error || "Not tested yet"}
                    </p>
                  </div>
                </div>
                <TestResultBadge result={testResults.groq} />
              </div>

              {/* Supabase Test */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Supabase Connection</h3>
                    <p className="text-sm text-muted-foreground">
                      {testResults.supabase?.success
                        ? "Database service connection successful"
                        : testResults.supabase?.error || "Not tested yet"}
                    </p>
                  </div>
                </div>
                <TestResultBadge result={testResults.supabase} />
              </div>

              {/* Database Test */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Database Schema</h3>
                    <p className="text-sm text-muted-foreground">
                      {testResults.database?.success
                        ? "All tables and data verified"
                        : testResults.database?.error || "Not tested yet"}
                    </p>
                  </div>
                </div>
                <TestResultBadge result={testResults.database} />
              </div>

              {/* Detailed Results */}
              {(testResults.groq || testResults.supabase || testResults.database) && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <h4 className="font-semibold mb-2">Detailed Results</h4>
                  <div className="space-y-2">
                    {Object.entries(testResults).map(([key, result]) => {
                      if (!result) return null
                      return (
                        <details key={key} className="border rounded p-2">
                          <summary className="cursor-pointer font-medium capitalize">{key} Test Details</summary>
                          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </details>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const demoAccounts = [
  {
    email: "admin@radiologyai.com",
    password: "admin123",
    role: "System Administrator",
    description: "Full system access and user management",
    color: "bg-red-50 border-red-200",
  },
  {
    email: "dr.smith@hospital.com",
    password: "doctor123",
    role: "Radiologist",
    description: "Upload and analyze radiology reports",
    color: "bg-blue-50 border-blue-200",
  },
  {
    email: "dr.johnson@hospital.com",
    password: "reviewer123",
    role: "Reviewer",
    description: "Review and validate AI findings",
    color: "bg-green-50 border-green-200",
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Attempting login with email:", email)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("[v0] Sign in result:", result)

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome to RadiologyAI!",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setLoadingAccount(demoEmail)
    setError("")

    try {
      console.log("[v0] Attempting demo login with email:", demoEmail)
      const result = await signIn("credentials", {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
      })

      console.log("[v0] Demo sign in result:", result)

      if (result?.error) {
        setError("Demo login failed. Please try again.")
        toast({
          title: "Demo Login Failed",
          description: "Please try again or contact support.",
          variant: "destructive",
        })
      } else if (result?.ok) {
        toast({
          title: "Demo Login Successful",
          description: "Welcome to RadiologyAI!",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("[v0] Demo login error:", error)
      setError("Demo login failed. Please try again.")
      toast({
        title: "Error",
        description: "Demo login failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingAccount(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <Brain className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">RadiologyAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access the AI-powered radiology analysis platform</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Login Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || loadingAccount !== null}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || loadingAccount !== null}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || loadingAccount !== null}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || loadingAccount !== null}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Demo Accounts</CardTitle>
              <CardDescription>Try RadiologyAI with these demo accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoAccounts.map((account, index) => (
                <div key={index} className={`p-4 border-2 rounded-lg transition-all ${account.color}`}>
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900">{account.role}</h3>
                    <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="font-mono bg-white/50 px-2 py-1 rounded">📧 {account.email}</div>
                      <div className="font-mono bg-white/50 px-2 py-1 rounded">🔑 {account.password}</div>
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={isLoading || loadingAccount !== null}
                  >
                    {loadingAccount === account.email ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      `Login as ${account.role}`
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help setting up? Check out our{" "}
            <Link href="/setup" className="text-blue-600 hover:underline font-medium">
              setup guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

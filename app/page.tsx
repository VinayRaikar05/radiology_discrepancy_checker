"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Shield, Stethoscope, Users, BarChart3, Upload, Search, CheckCircle } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms detect potential false findings in radiology reports",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Comprehensive validation system ensures accuracy and reliability of medical diagnoses",
  },
  {
    icon: Stethoscope,
    title: "Medical Expertise",
    description: "Built by radiologists for radiologists with deep understanding of medical workflows",
  },
  {
    icon: Users,
    title: "Collaborative Platform",
    description: "Multi-user system supporting different roles from residents to senior radiologists",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive reporting and analytics to track performance and identify trends",
  },
  {
    icon: Upload,
    title: "Easy Integration",
    description: "Seamless integration with existing PACS and RIS systems for streamlined workflow",
  },
]

const stats = [
  { label: "Reports Analyzed", value: "50,000+", icon: Search },
  { label: "False Findings Detected", value: "2,847", icon: CheckCircle },
  { label: "Accuracy Rate", value: "94.7%", icon: BarChart3 },
  { label: "Active Users", value: "1,200+", icon: Users },
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Redirecting to Dashboard...</h1>
          <p className="text-gray-600">Welcome back, {session.user?.name}!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RadiologyAI</span>
            <Badge variant="secondary" className="ml-2">
              Beta
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/setup">
              <Button variant="outline">Setup Guide</Button>
            </Link>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-Powered Radiology
              <span className="text-blue-600"> Quality Assurance</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Advanced machine learning system designed to detect false findings in radiology reports, improving
              diagnostic accuracy and patient safety through intelligent analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-3">
                  Try Demo Accounts
                </Button>
              </Link>
              <Link href="/setup">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Setup Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center">
                  <IconComponent className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive AI Analysis Platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with medical expertise to provide accurate, reliable, and
              actionable insights for radiology professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <IconComponent className="h-12 w-12 text-blue-600 mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the power of AI-assisted radiology analysis with our demo accounts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Try Demo Now
              </Button>
            </Link>
            <Link href="/setup">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Setup Your Instance
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">RadiologyAI</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2025 RadiologyAI. Advanced AI for Medical Imaging Analysis.</p>
            <p className="mt-2">Built with Next.js, Supabase, and Groq AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Brain, Shield, Stethoscope, Users, BarChart3, Upload, Search, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced models surface potential inaccuracies in radiology interpretations before they reach patients.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    description: "Structured workflows and audit trails help clinical teams meet regulatory and accreditation requirements.",
  },
  {
    icon: Stethoscope,
    title: "Clinical Focus",
    description: "Built with radiologists to fit existing reporting processes and integrate with multidisciplinary teams.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Granular permissions for administrators, radiologists, reviewers, and residents keep data protected.",
  },
  {
    icon: BarChart3,
    title: "Operational Insight",
    description: "Real-time analytics highlight trends, turnaround times, and false-positive performance metrics.",
  },
  {
    icon: Upload,
    title: "Seamless Intake",
    description: "Securely ingest studies from PACS/RIS systems or manual uploads with automated normalization.",
  },
]

const stats = [
  { label: "Reports Monitored", value: "50,000+", icon: Search },
  { label: "False Findings Prevented", value: "2,800+", icon: CheckCircle },
  { label: "Average Accuracy", value: "95%", icon: BarChart3 },
  { label: "Clinical Teams", value: "1,200+", icon: Users },
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
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
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RadiologyAI</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Create account</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Radiology quality assurance that scales with your clinical team
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              RadiologyAI continuously validates reports, highlights discrepancies, and equips reviewers with the
              context they need to protect patients and streamline operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Get started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive AI analysis platform</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Pair AI-driven detection with structured workflows so every report benefits from automated oversight and
              human expertise.
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
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Bring confident reporting to every study</h2>
          <p className="text-xl mb-8 opacity-90">
            Launch RadiologyAI in your environment with secure authentication, audit-ready logs, and automated triage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Create your account
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Brain className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">RadiologyAI</span>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2025 RadiologyAI. All rights reserved.</p>
            <p className="mt-2">Built with Next.js, Supabase, and Groq AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}



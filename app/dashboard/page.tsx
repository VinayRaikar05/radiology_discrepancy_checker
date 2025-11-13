"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle,
  FileText,
  Loader2,
  LogOut,
  Upload,
  Users,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  totalReports: number
  analyzedReports: number
  flaggedReports: number
  averageConfidence: number
  riskDistribution: {
    low: number
    medium: number
    high: number
    critical: number
  }
  recentActivity: {
    description: string
    timestamp: string
    status: "success" | "warning" | "info"
  }[]
}

const defaultStats: DashboardStats = {
  totalReports: 0,
  analyzedReports: 0,
  flaggedReports: 0,
  averageConfidence: 0,
  riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
  recentActivity: [],
}

const roleColors = {
  admin: "bg-red-100 text-red-800",
  radiologist: "bg-blue-100 text-blue-800",
  reviewer: "bg-green-100 text-green-800",
  resident: "bg-purple-100 text-purple-800",
}

const roleActions = {
  admin: [
    { title: "User Management", description: "Manage system users and permissions", icon: Users, href: "/admin/users" },
    {
      title: "System Analytics",
      description: "View comprehensive system analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    { title: "Upload Reports", description: "Upload radiology reports for analysis", icon: Upload, href: "/upload" },
    { title: "Review Queue", description: "Review flagged findings", icon: FileText, href: "/review" },
  ],
  radiologist: [
    { title: "Upload Reports", description: "Upload radiology reports for AI analysis", icon: Upload, href: "/upload" },
    { title: "Review Results", description: "Review AI analysis results", icon: FileText, href: "/review" },
    { title: "Analytics", description: "View your performance analytics", icon: BarChart3, href: "/analytics" },
  ],
  reviewer: [
    { title: "Review Queue", description: "Review and validate AI findings", icon: FileText, href: "/review" },
    { title: "Analytics", description: "View validation analytics", icon: BarChart3, href: "/analytics" },
  ],
  resident: [
    { title: "Upload Reports", description: "Upload radiology reports for AI analysis", icon: Upload, href: "/upload" },
    { title: "Review Results", description: "Review AI analysis results", icon: FileText, href: "/review" },
  ],
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchStats = async () => {
      if (!session) return

      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) {
          throw new Error("Failed to load dashboard metrics.")
        }
        const data = await response.json()
        setStats({
          totalReports: data.totalReports ?? 0,
          analyzedReports: data.analyzedReports ?? 0,
          flaggedReports: data.flaggedReports ?? 0,
          averageConfidence: Number.isFinite(data.averageConfidence) ? Math.round(data.averageConfidence * 100) / 100 : 0,
          riskDistribution: data.riskDistribution ?? defaultStats.riskDistribution,
          recentActivity: Array.isArray(data.recentActivity) ? data.recentActivity : [],
        })
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError("Unable to load analytics. Please try again later.")
        setStats(defaultStats)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const userRole = session?.user.role as keyof typeof roleActions
  const actions = roleActions[userRole] || roleActions.radiologist

  const metricCards = useMemo(
    () => [
      {
        label: "Total Reports",
        value: stats.totalReports.toLocaleString(),
        description: "Reports ingested in the current period",
        icon: FileText,
      },
      {
        label: "Analyzed Reports",
        value: stats.analyzedReports.toLocaleString(),
        description: "Reports processed by the AI engine",
        icon: CheckCircle,
      },
      {
        label: "Flagged Reviews",
        value: stats.flaggedReports.toLocaleString(),
        description: "Reports requiring manual attention",
        icon: AlertTriangle,
      },
      {
        label: "Average Confidence",
        value: `${stats.averageConfidence.toFixed(2)}%`,
        description: "Mean confidence across analyzed reports",
        icon: BarChart3,
      },
    ],
    [stats],
  )

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Loading dashboard...</h2>
          <p className="text-sm text-gray-500">Fetching the latest metrics for your workspace.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RadiologyAI</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session.user.name
                      ?.split(" ")
                      .map((part) => part[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={roleColors[userRole] || "bg-gray-100 text-gray-800"}>
                      {session.user.role}
                    </Badge>
                    <span className="text-xs text-gray-500">{session.user.department}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {session.user.name?.split(" ")[0]}.</h1>
          <p className="text-gray-600">Here is the latest performance snapshot for your radiology program.</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {metricCards.map((card) => {
            const IconComponent = card.icon
            return (
              <Card key={card.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>High-impact tasks for your role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actions.map((action) => {
                const IconComponent = action.icon
                return (
                  <Link key={action.title} href={action.href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <IconComponent className="h-6 w-6 text-blue-600 mt-1" />
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk distribution</CardTitle>
              <CardDescription>Breakdown of AI-detected risk levels across analyzed reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.riskDistribution).map(([level, value]) => (
                  <div key={level} className="rounded-lg border bg-white p-4">
                    <p className="text-xs uppercase text-gray-500">{level}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Traceability of the most recent automated and manual events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity recorded.</p>
                ) : (
                  stats.recentActivity.map((item, index) => {
                    const statusStyles =
                      item.status === "warning"
                        ? "bg-yellow-50 text-yellow-900"
                        : item.status === "success"
                          ? "bg-green-50 text-green-900"
                          : "bg-blue-50 text-blue-900"

                    const IconComponent = item.status === "warning" ? AlertTriangle : CheckCircle

                    return (
                      <div key={`${item.description}-${index}`} className={`flex items-start space-x-3 rounded-lg p-3 ${statusStyles}`}>
                        <IconComponent className="h-5 w-5 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs opacity-80">{item.timestamp}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


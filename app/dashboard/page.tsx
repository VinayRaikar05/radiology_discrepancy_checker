"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Brain, Upload, BarChart3, Users, FileText, AlertTriangle, CheckCircle, Clock, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"

interface DashboardStats {
  totalReports: number
  falseFindings: number
  accuracy: number
  pendingReviews: number
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
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    falseFindings: 0,
    accuracy: 0,
    pendingReviews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    // Simulate loading stats
    const loadStats = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data based on user role
      const mockStats = {
        admin: { totalReports: 15420, falseFindings: 847, accuracy: 94.7, pendingReviews: 23 },
        radiologist: { totalReports: 2340, falseFindings: 127, accuracy: 95.2, pendingReviews: 8 },
        reviewer: { totalReports: 890, falseFindings: 45, accuracy: 96.1, pendingReviews: 12 },
      }

      const userRole = session?.user?.role as keyof typeof mockStats
      setStats(mockStats[userRole] || mockStats.radiologist)
      setIsLoading(false)
    }

    if (session) {
      loadStats()
    }
  }, [session])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your data</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = session.user.role as keyof typeof roleActions
  const actions = roleActions[userRole] || roleActions.radiologist

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">RadiologyAI</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {session.user.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={roleColors[userRole] || "bg-gray-100 text-gray-800"}>{session.user.role}</Badge>
                    <span className="text-xs text-gray-500">{session.user.department}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {session.user.name?.split(" ")[0]}!</h1>
          <p className="text-gray-600">Here's your RadiologyAI dashboard overview for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">False Findings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.falseFindings}</div>
              <p className="text-xs text-muted-foreground">-8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accuracy}%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your role as {session.user.role}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link key={index} href={action.href}>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activity and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Report Analysis Completed</p>
                  <p className="text-xs text-gray-600">Chest X-ray analysis completed with 94% confidence</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Potential False Finding Detected</p>
                  <p className="text-xs text-gray-600">CT scan requires manual review</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">15 min ago</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Upload className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">New Report Uploaded</p>
                  <p className="text-xs text-gray-600">MRI brain scan queued for analysis</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">1 hour ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

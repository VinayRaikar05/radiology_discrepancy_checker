"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Download,
  Calendar,
  Loader2,
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

interface AnalyticsData {
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
  studyTypeDistribution: Record<string, number>
  statusDistribution: Record<string, number>
  confidenceRanges: Record<string, number>
  dailyTrends: Array<{
    date: string
    reports: number
    analyses: number
    flagged: number
  }>
}

const COLORS = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#dc2626",
}

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      let url = "/api/dashboard/stats"
      if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90
        const start = startOfDay(subDays(new Date(), days)).toISOString()
        const end = endOfDay(new Date()).toISOString()
        url += `?start=${start}&end=${end}`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch analytics")

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Analytics fetch error:", err)
      setError("Failed to load analytics. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (!analytics) return

    const csv = [
      ["Metric", "Value"],
      ["Total Reports", analytics.totalReports],
      ["Analyzed Reports", analytics.analyzedReports],
      ["Flagged Reports", analytics.flaggedReports],
      ["Average Confidence", `${(analytics.averageConfidence * 100).toFixed(2)}%`],
      ["Risk - Low", analytics.riskDistribution.low],
      ["Risk - Medium", analytics.riskDistribution.medium],
      ["Risk - High", analytics.riskDistribution.high],
      ["Risk - Critical", analytics.riskDistribution.critical],
    ].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-4">{error || "No analytics data available"}</p>
              <Button onClick={fetchAnalytics}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const riskData = [
    { name: "Low", value: analytics.riskDistribution.low, color: COLORS.low },
    { name: "Medium", value: analytics.riskDistribution.medium, color: COLORS.medium },
    { name: "High", value: analytics.riskDistribution.high, color: COLORS.high },
    { name: "Critical", value: analytics.riskDistribution.critical, color: COLORS.critical },
  ]

  const studyTypeData = Object.entries(analytics.studyTypeDistribution).map(([name, value]) => ({
    name: name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }))

  const confidenceData = Object.entries(analytics.confidenceRanges).map(([name, value]) => ({
    name,
    value,
  }))

  const dailyData = analytics.dailyTrends.map((d) => ({
    date: format(new Date(d.date), "MMM dd"),
    reports: d.reports,
    analyses: d.analyses,
    flagged: d.flagged,
  }))

  const detectionRate = analytics.totalReports > 0
    ? ((analytics.flaggedReports / analytics.totalReports) * 100).toFixed(1)
    : "0.0"

  const falsePositiveRate = analytics.analyzedReports > 0
    ? ((analytics.riskDistribution.low / analytics.analyzedReports) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Detection Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detectionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.flaggedReports} of {analytics.totalReports} reports flagged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">False Positive Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{falsePositiveRate}%</div>
              <p className="text-xs text-muted-foreground">
                Low risk findings identified
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(analytics.averageConfidence * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across {analytics.analyzedReports} analyses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Processed</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReports.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.analyzedReports} analyzed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Trends</CardTitle>
              <CardDescription>Reports and analyses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  reports: { label: "Reports", color: "#3b82f6" },
                  analyses: { label: "Analyses", color: "#10b981" },
                  flagged: { label: "Flagged", color: "#ef4444" },
                }}
                className="h-[300px]"
              >
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="reports" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="analyses" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="flagged" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Breakdown by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  low: { label: "Low", color: COLORS.low },
                  medium: { label: "Medium", color: COLORS.medium },
                  high: { label: "High", color: COLORS.high },
                  critical: { label: "Critical", color: COLORS.critical },
                }}
                className="h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Study Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Study Type Breakdown</CardTitle>
              <CardDescription>Distribution by study type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={studyTypeData.reduce((acc, item, idx) => {
                  acc[item.name.toLowerCase().replace(/\s+/g, "")] = {
                    label: item.name,
                    color: CHART_COLORS[idx % CHART_COLORS.length],
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[300px]"
              >
                <BarChart data={studyTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Confidence Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Confidence Distribution</CardTitle>
              <CardDescription>Analysis confidence ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={confidenceData.reduce((acc, item, idx) => {
                  acc[item.name] = {
                    label: `${item.name}%`,
                    color: CHART_COLORS[idx % CHART_COLORS.length],
                  }
                  return acc
                }, {} as Record<string, { label: string; color: string }>)}
                className="h-[300px]"
              >
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>AI model performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {(analytics.averageConfidence * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-green-600">Overall Accuracy</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">
                  {analytics.analyzedReports > 0
                    ? ((analytics.analyzedReports / analytics.totalReports) * 100).toFixed(1)
                    : "0.0"}%
                </div>
                <p className="text-sm text-blue-600">Analysis Coverage</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">
                  {analytics.riskDistribution.high + analytics.riskDistribution.critical}
                </div>
                <p className="text-sm text-purple-600">High/Critical Risks</p>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-lg">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {analytics.totalReports > 0
                    ? (analytics.totalReports / 30).toFixed(1)
                    : "0.0"}
                </div>
                <p className="text-sm text-orange-600">Avg Reports/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

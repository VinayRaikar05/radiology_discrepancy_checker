"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Clock, Users, Award, AlertTriangle, CheckCircle } from "lucide-react"

interface PerformanceMetrics {
  accuracy_rate: number
  avg_turnaround_time_minutes: number
  peer_review_score: number
  ai_agreement_rate: number
  false_positive_rate: number
  false_negative_rate: number
  total_studies: number
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPerformanceMetrics()
  }, [timeRange])

  const loadPerformanceMetrics = async () => {
    setLoading(true)

    // Simulated performance data
    setTimeout(() => {
      setMetrics({
        accuracy_rate: 94.2,
        avg_turnaround_time_minutes: 18.5,
        peer_review_score: 4.7,
        ai_agreement_rate: 89.3,
        false_positive_rate: 3.1,
        false_negative_rate: 2.7,
        total_studies: 247,
      })
      setLoading(false)
    }, 1000)
  }

  const getScoreColor = (score: number, isInverted = false) => {
    if (isInverted) {
      if (score <= 3) return "text-green-600"
      if (score <= 5) return "text-yellow-600"
      return "text-red-600"
    } else {
      if (score >= 90) return "text-green-600"
      if (score >= 80) return "text-yellow-600"
      return "text-red-600"
    }
  }

  const getProgressColor = (score: number, isInverted = false) => {
    if (isInverted) {
      if (score <= 3) return "bg-green-600"
      if (score <= 5) return "bg-yellow-600"
      return "bg-red-600"
    } else {
      if (score >= 90) return "bg-green-600"
      if (score >= 80) return "bg-yellow-600"
      return "bg-red-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading performance metrics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
            </div>
            <div className="flex space-x-2">
              {["7d", "30d", "90d", "1y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    timeRange === range ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diagnostic Accuracy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(metrics?.accuracy_rate || 0)}`}>
                {metrics?.accuracy_rate}%
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.1% from last period
              </div>
              <Progress value={metrics?.accuracy_rate || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Turnaround Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics?.avg_turnaround_time_minutes}m</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                -3.2m faster
              </div>
              <Progress value={Math.max(0, 100 - (metrics?.avg_turnaround_time_minutes || 0))} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peer Review Score</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics?.peer_review_score}/5.0</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.3 improvement
              </div>
              <Progress value={(metrics?.peer_review_score || 0) * 20} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agreement Rate</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(metrics?.ai_agreement_rate || 0)}`}>
                {metrics?.ai_agreement_rate}%
              </div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +1.8% improvement
              </div>
              <Progress value={metrics?.ai_agreement_rate || 0} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Error Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>False positive and negative rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">False Positive Rate</span>
                    <span className={`text-sm font-bold ${getScoreColor(metrics?.false_positive_rate || 0, true)}`}>
                      {metrics?.false_positive_rate}%
                    </span>
                  </div>
                  <Progress value={metrics?.false_positive_rate || 0} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">Target: &lt;3%</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">False Negative Rate</span>
                    <span className={`text-sm font-bold ${getScoreColor(metrics?.false_negative_rate || 0, true)}`}>
                      {metrics?.false_negative_rate}%
                    </span>
                  </div>
                  <Progress value={metrics?.false_negative_rate || 0} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">Target: &lt;2%</p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Improvement Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        Consider additional training on chest X-ray interpretation
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">Excellent performance on CT scan analysis</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productivity Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Productivity Overview</CardTitle>
              <CardDescription>Study volume and efficiency metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{metrics?.total_studies}</div>
                  <p className="text-sm text-gray-600">Total Studies Reviewed</p>
                  <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% vs last period
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">8.2</div>
                    <p className="text-xs text-gray-600">Studies/hour</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-900">97%</div>
                    <p className="text-xs text-gray-600">On-time delivery</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Performance Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      Accuracy Expert
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Speed Demon
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      <Users className="h-3 w-3 mr-1" />
                      Team Player
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benchmarking */}
        <Card>
          <CardHeader>
            <CardTitle>Peer Benchmarking</CardTitle>
            <CardDescription>How you compare to other radiologists in your specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Top 15%</div>
                <p className="text-sm text-gray-600 mb-4">Overall Performance Ranking</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">Top 25%</div>
                <p className="text-sm text-gray-600 mb-4">Turnaround Time</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">Top 10%</div>
                <p className="text-sm text-gray-600 mb-4">AI Collaboration</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

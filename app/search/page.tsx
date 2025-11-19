"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  FileText,
  Loader2,
  Filter,
  Calendar,
  Download,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Report {
  id: string
  patient_id: string
  study_type: string
  report_text: string
  status: string
  created_at: string
  analysis_results?: Array<{
    risk_level: string
    confidence: number
  }>
}

export default function SearchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    studyType: "",
    status: "",
    riskLevel: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const performSearch = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: (page * 20).toString(),
      })

      if (searchQuery) params.append("q", searchQuery)
      if (filters.studyType) params.append("studyType", filters.studyType)
      if (filters.status) params.append("status", filters.status)
      if (filters.riskLevel) params.append("riskLevel", filters.riskLevel)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/reports/search?${params}`)
      if (!response.ok) throw new Error("Search failed")

      const data = await response.json()
      setReports(data.reports || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery || Object.values(filters).some((v) => v)) {
      performSearch()
    }
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    performSearch()
  }

  const handleExport = () => {
    const csv = [
      ["Patient ID", "Study Type", "Status", "Risk Level", "Confidence", "Created At"],
      ...reports.map((report) => [
        report.patient_id,
        report.study_type,
        report.status,
        report.analysis_results?.[0]?.risk_level || "N/A",
        report.analysis_results?.[0]?.confidence
          ? `${(report.analysis_results[0].confidence * 100).toFixed(1)}%`
          : "N/A",
        format(new Date(report.created_at), "yyyy-MM-dd HH:mm:ss"),
      ]),
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reports-search-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Search Reports</h1>
            </div>
            {reports.length > 0 && (
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
            <CardDescription>Search reports by text, study type, status, and more</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search in report text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Select value={filters.studyType} onValueChange={(v) => setFilters({ ...filters, studyType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Study Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="chest-xray">Chest X-Ray</SelectItem>
                    <SelectItem value="ct-scan">CT Scan</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                    <SelectItem value="ultrasound">Ultrasound</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.riskLevel} onValueChange={(v) => setFilters({ ...filters, riskLevel: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />

                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        )}

        {!loading && reports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Found {total} report{total !== 1 ? "s" : ""} | Showing {reports.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-mono text-sm text-gray-600">
                              {report.patient_id}
                            </span>
                            <Badge variant="outline">{report.study_type}</Badge>
                            <Badge>{report.status}</Badge>
                            {report.analysis_results?.[0] && (
                              <Badge className={getRiskColor(report.analysis_results[0].risk_level)}>
                                {report.analysis_results[0].risk_level.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {report.report_text.substring(0, 200)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {format(new Date(report.created_at), "MMM dd, yyyy HH:mm")}
                            </span>
                            {report.analysis_results?.[0] && (
                              <span>
                                Confidence:{" "}
                                {(report.analysis_results[0].confidence * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/review?id=${report.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {Math.ceil(total / 20)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * 20 >= total}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && reports.length === 0 && searchQuery && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reports found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}

        {!loading && !searchQuery && reports.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Enter a search query to find reports.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}


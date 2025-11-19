"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Loader2,
  Search,
  Download,
  Calendar,
  Filter,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"

interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchLogs()
    }
  }, [session, page, filters])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "50",
        offset: (page * 50).toString(),
      })

      if (filters.action) params.append("action", filters.action)
      if (filters.entityType) params.append("entityType", filters.entityType)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const response = await fetch(`/api/audit-logs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch audit logs")

      const data = await response.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const csv = [
      ["Timestamp", "User ID", "Action", "Entity Type", "Entity ID", "IP Address", "Details"],
      ...logs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.user_id || "",
        log.action,
        log.entity_type,
        log.entity_id || "",
        log.ip_address || "",
        JSON.stringify(log.details),
      ]),
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-100 text-green-800"
    if (action.includes("update")) return "bg-blue-100 text-blue-800"
    if (action.includes("delete")) return "bg-red-100 text-red-800"
    if (action.includes("login")) return "bg-purple-100 text-purple-800"
    return "bg-gray-100 text-gray-800"
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (session?.user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={fetchLogs} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={filters.action} onValueChange={(v) => setFilters({ ...filters, action: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="user.create">User Create</SelectItem>
                  <SelectItem value="user.update">User Update</SelectItem>
                  <SelectItem value="user.delete">User Delete</SelectItem>
                  <SelectItem value="report.create">Report Create</SelectItem>
                  <SelectItem value="report.analyze">Report Analyze</SelectItem>
                  <SelectItem value="report.flag">Report Flag</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.entityType} onValueChange={(v) => setFilters({ ...filters, entityType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Entity Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Entity Types</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="system">System</SelectItem>
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
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Log Entries</CardTitle>
            <CardDescription>
              Total: {total} entries | Showing {logs.length} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Timestamp</th>
                    <th className="text-left p-2">User ID</th>
                    <th className="text-left p-2">Action</th>
                    <th className="text-left p-2">Entity</th>
                    <th className="text-left p-2">IP Address</th>
                    <th className="text-left p-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {log.user_id ? log.user_id.substring(0, 8) + "..." : "System"}
                      </td>
                      <td className="p-2">
                        <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{log.entity_type}</div>
                          {log.entity_id && (
                            <div className="text-xs text-gray-500 font-mono">
                              {log.entity_id.substring(0, 8)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-xs font-mono">{log.ip_address || "N/A"}</td>
                      <td className="p-2">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:underline text-xs">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-w-md">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {Math.ceil(total / 50)}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * 50 >= total}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}


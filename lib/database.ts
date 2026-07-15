import { getSupabaseForServer } from "@/lib/supabase"

export interface RadiologyReport {
  id: string
  patient_id: string
  study_type: string
  report_text: string
  radiologist_id?: string
  created_at: string
  updated_at: string
  status: "pending" | "reviewed" | "approved" | "flagged"
  previous_report_id?: string
}

export interface AnalysisResult {
  id: string
  report_id: string
  confidence: number
  risk_level: "low" | "medium" | "high" | "critical"
  findings: string[]
  potential_false_findings: Array<{
    finding: string
    likelihood: string
    reasoning: string
    source: string
    ml_confidence: number
  }>
  recommendations: string[]
  summary: string
  medical_relevance_score: number
  discrepancies: Array<{
    type: string
    description: string
    severity: string
    confidence: number
  }>
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "radiologist" | "reviewer" | "resident"
  department: string
  created_at: string
  updated_at: string
  is_active: boolean
  password_hash?: string
}

export class DatabaseService {
  /**
   * Returns a lazily-initialized Supabase client.
   * This avoids the previous bug where top-level createClient() would
   * crash during Next.js build when env vars weren't set.
   */
  private getClient() {
    return getSupabaseForServer()
  }

  // ── User operations ──────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from("users")
        .select("id, email, full_name, role, department, created_at, updated_at, is_active")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching user:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.getClient()
        .from("users")
        .select("id, email, full_name, role, department, is_active, created_at, updated_at")
        .eq("email", email)
        .eq("is_active", true)
        .single()

      if (error) {
        console.error("Error fetching user by email:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User | null> {
    try {
      const { data, error } = await this.getClient().from("users").insert([userData]).select().single()

      if (error) {
        console.error("Error creating user:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getUsers(limit = 50, offset = 0): Promise<User[]> {
    try {
      const { data, error } = await this.getClient()
        .from("users")
        .select("id, email, full_name, role, department, is_active, created_at, updated_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching users:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  // ── Report operations ────────────────────────────────────────────────────

  async createReport(
    reportData: Omit<RadiologyReport, "id" | "created_at" | "updated_at">,
  ): Promise<RadiologyReport | null> {
    try {
      const { data, error } = await this.getClient().from("radiology_reports").insert([reportData]).select().single()

      if (error) {
        console.error("Error creating report:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getReport(id: string): Promise<RadiologyReport | null> {
    try {
      const { data, error } = await this.getClient().from("radiology_reports").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching report:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getReports(limit = 50, offset = 0): Promise<RadiologyReport[]> {
    try {
      const { data, error } = await this.getClient()
        .from("radiology_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching reports:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  async getReportsByPatient(patientId: string): Promise<RadiologyReport[]> {
    try {
      const { data, error } = await this.getClient()
        .from("radiology_reports")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reports by patient:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  // ── Analysis operations ──────────────────────────────────────────────────

  async createAnalysis(
    analysisData: Omit<AnalysisResult, "id" | "created_at" | "updated_at">,
  ): Promise<AnalysisResult | null> {
    try {
      const { data, error } = await this.getClient().from("analysis_results").insert([analysisData]).select().single()

      if (error) {
        console.error("Error creating analysis:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getAnalysis(reportId: string): Promise<AnalysisResult | null> {
    try {
      const { data, error } = await this.getClient().from("analysis_results").select("*").eq("report_id", reportId).single()

      if (error) {
        console.error("Error fetching analysis:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getAnalytics(dateRange?: { start: string; end: string }) {
    try {
      const client = this.getClient()

      // Build query with date range filter if provided
      let reportsQuery = client.from("radiology_reports").select("id, status, study_type, created_at, radiologist_id")
      let analysesQuery = client.from("analysis_results").select("confidence, risk_level, created_at, report_id")

      if (dateRange) {
        reportsQuery = reportsQuery.gte("created_at", dateRange.start).lte("created_at", dateRange.end)
        analysesQuery = analysesQuery.gte("created_at", dateRange.start).lte("created_at", dateRange.end)
      }

      const { data: reports, error: reportsError } = await reportsQuery
      const { data: analyses, error: analysesError } = await analysesQuery

      if (reportsError) {
        console.error("Error fetching analytics:", reportsError)
        return null
      }

      if (analysesError) {
        console.error("Error fetching analysis analytics:", analysesError)
        return null
      }

      // Process the data
      const totalReports = reports?.length || 0
      const analyzedReports = analyses?.length || 0
      const flaggedReports = reports?.filter((r) => r.status === "flagged").length || 0

      const averageConfidence = analyses?.length
        ? analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
        : 0

      const riskDistribution = analyses?.reduce(
        (acc, a) => {
          const riskLevel = a.risk_level as keyof typeof acc
          if (riskLevel in acc) {
            acc[riskLevel] = (acc[riskLevel] || 0) + 1
          }
          return acc
        },
        { low: 0, medium: 0, high: 0, critical: 0 },
      ) || { low: 0, medium: 0, high: 0, critical: 0 }

      // Study type distribution
      const studyTypeDistribution = reports?.reduce((acc, r) => {
        const type = r.study_type || "unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Daily trends (last 30 days)
      const dailyTrends = this._calculateDailyTrends(reports || [], analyses || [])

      // Status distribution
      const statusDistribution = reports?.reduce((acc, r) => {
        const status = r.status || "pending"
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Confidence distribution
      const confidenceRanges = {
        "0-50": 0,
        "51-70": 0,
        "71-85": 0,
        "86-95": 0,
        "96-100": 0,
      }
      analyses?.forEach((a) => {
        const conf = Math.round(a.confidence * 100)
        if (conf <= 50) confidenceRanges["0-50"]++
        else if (conf <= 70) confidenceRanges["51-70"]++
        else if (conf <= 85) confidenceRanges["71-85"]++
        else if (conf <= 95) confidenceRanges["86-95"]++
        else confidenceRanges["96-100"]++
      })

      return {
        totalReports,
        analyzedReports,
        flaggedReports,
        averageConfidence,
        riskDistribution,
        studyTypeDistribution,
        statusDistribution,
        confidenceRanges,
        dailyTrends,
        recentActivity: [], // Could be implemented with more complex queries
      }
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  private _calculateDailyTrends(reports: any[], analyses: any[]) {
    const trends: Record<string, { reports: number; analyses: number; flagged: number }> = {}
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Initialize all days
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const dateKey = date.toISOString().split("T")[0]
      trends[dateKey] = { reports: 0, analyses: 0, flagged: 0 }
    }

    // Count reports
    reports.forEach((r) => {
      const reportDate = new Date(r.created_at)
      if (reportDate >= thirtyDaysAgo) {
        const dateKey = reportDate.toISOString().split("T")[0]
        if (trends[dateKey]) {
          trends[dateKey].reports++
          if (r.status === "flagged") {
            trends[dateKey].flagged++
          }
        }
      }
    })

    // Count analyses
    analyses.forEach((a) => {
      const analysisDate = new Date(a.created_at)
      if (analysisDate >= thirtyDaysAgo) {
        const dateKey = analysisDate.toISOString().split("T")[0]
        if (trends[dateKey]) {
          trends[dateKey].analyses++
        }
      }
    })

    return Object.entries(trends)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // ── Full-text search ─────────────────────────────────────────────────────

  async searchReports(query: string, limit = 20): Promise<RadiologyReport[]> {
    try {
      const { data, error } = await this.getClient()
        .from("radiology_reports")
        .select("*")
        .textSearch("report_text", query, { type: "websearch" })
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        // Fall back to ILIKE search if full-text search isn't configured
        const { data: fallbackData, error: fallbackError } = await this.getClient()
          .from("radiology_reports")
          .select("*")
          .ilike("report_text", `%${query}%`)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (fallbackError) {
          console.error("Error searching reports:", fallbackError)
          return []
        }

        return fallbackData || []
      }

      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  async getReportsForReview(): Promise<any[]> {
    try {
      const { data, error } = await this.getClient()
        .from("radiology_reports")
        .select("*, analysis_results(*)")
        .in("status", ["pending", "flagged"])
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching reports for review:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  async getSimilarReportsByFindings(studyType: string, findings: string[], limit = 3): Promise<any[]> {
    try {
      if (findings.length === 0) return []
      
      const client = this.getClient()
      // Fetch reports of same study type
      const { data: reports, error } = await client
        .from("radiology_reports")
        .select("*, analysis_results(*)")
        .eq("study_type", studyType)
        .limit(30)

      if (error || !reports) {
        return []
      }

      // Filter reports where the analysis contains any of the matching findings
      const matched = reports.filter((report: any) => {
        const analysis = report.analysis_results?.[0]
        if (!analysis || !analysis.findings) return false
        return analysis.findings.some((f: string) => 
          findings.some(label => f.toLowerCase().includes(label.toLowerCase()) || label.toLowerCase().includes(f.toLowerCase()))
        )
      })

      return matched.slice(0, limit)
    } catch (error) {
      console.error("Failed to fetch similar reports by findings:", error)
      return []
    }
  }

  // ── Comment & Status operations ──────────────────────────────────────────

  async createComment(commentData: {
    report_id: string
    user_id?: string
    comment_text: string
  }): Promise<any> {
    try {
      const { data, error } = await this.getClient()
        .from("report_comments")
        .insert([commentData])
        .select()
        .single()

      if (error) {
        console.error("Error creating comment:", error)
        return null
      }
      return data
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  async getComments(reportId: string): Promise<any[]> {
    try {
      const { data, error } = await this.getClient()
        .from("report_comments")
        .select("*, users(full_name, role)")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching comments:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  async updateReportStatus(reportId: string, status: "pending" | "reviewed" | "approved" | "flagged"): Promise<boolean> {
    try {
      const { error } = await this.getClient()
        .from("radiology_reports")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", reportId)

      if (error) {
        console.error("Error updating report status:", error)
        return false
      }
      return true
    } catch (error) {
      console.error("Database error:", error)
      return false
    }
  }

  // ── Health check ─────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.getClient().from("users").select("id").limit(1)

      return !error
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()

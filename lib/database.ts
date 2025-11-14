import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables are not configured.")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface RadiologyReport {
  id: string
  patient_id: string
  study_type: string
  report_text: string
  radiologist_id?: string
  created_at: string
  updated_at: string
  status: "pending" | "reviewed" | "approved" | "flagged"
}

export interface AnalysisResult {
  id: string
  report_id: string
  confidence: number
  risk_level: "low" | "medium" | "high" | "critical"
  findings: string[]
  potential_false_findings: any[]
  recommendations: string[]
  summary: string
  medical_relevance_score: number
  discrepancies: any[]
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
  private client = supabase

  constructor() {}

  // User operations
  async getUser(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.client
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
      const { data, error } = await this.client
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
      const { data, error } = await this.client.from("users").insert([userData]).select().single()

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
      const { data, error } = await this.client
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

  // Report operations
  async createReport(
    reportData: Omit<RadiologyReport, "id" | "created_at" | "updated_at">,
  ): Promise<RadiologyReport | null> {
    try {
      const { data, error } = await this.client.from("radiology_reports").insert([reportData]).select().single()

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
      const { data, error } = await this.client.from("radiology_reports").select("*").eq("id", id).single()

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
      const { data, error } = await this.client
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

  // Analysis operations
  async createAnalysis(
    analysisData: Omit<AnalysisResult, "id" | "created_at" | "updated_at">,
  ): Promise<AnalysisResult | null> {
    try {
      const { data, error } = await this.client.from("analysis_results").insert([analysisData]).select().single()

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
      const { data, error } = await this.client.from("analysis_results").select("*").eq("report_id", reportId).single()

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
      // Get basic counts
      const { data: reports, error: reportsError } = await this.client
        .from("radiology_reports")
        .select("id, status, created_at")

      if (reportsError) {
        console.error("Error fetching analytics:", reportsError)
        return null
      }

      const { data: analyses, error: analysesError } = await this.client
        .from("analysis_results")
        .select("confidence, risk_level, created_at")

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

      return {
        totalReports,
        analyzedReports,
        flaggedReports,
        averageConfidence,
        riskDistribution,
        recentActivity: [], // Could be implemented with more complex queries
      }
    } catch (error) {
      console.error("Database error:", error)
      return null
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client.from("users").select("id").limit(1)

      return !error
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService()

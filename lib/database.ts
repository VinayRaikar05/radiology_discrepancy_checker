import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client with service role key for server-side operations
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

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

  constructor() {
    if (!this.client) {
      console.warn("Supabase client not initialized. Database operations will use fallback data.")
    }
  }

  // User operations
  async getUser(id: string): Promise<User | null> {
    if (!this.client) {
      // Return demo user for development
      return {
        id,
        email: "demo@radiologyai.com",
        full_name: "Demo User",
        role: "radiologist",
        department: "Radiology",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      }
    }

    try {
      const { data, error } = await this.client.from("users").select("*").eq("id", id).single()

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
    if (!this.client) {
      // Return demo user for development
      return {
        id: "demo-user-id",
        email,
        full_name: "Demo User",
        role: "radiologist",
        department: "Radiology",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      }
    }

    try {
      const { data, error } = await this.client
        .from("users")
        .select("*")
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
    if (!this.client) {
      console.warn("Cannot create user: Database not connected")
      return {
        id: `user-${Date.now()}`,
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

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
    if (!this.client) {
      // Return mock users for development
      return [
        {
          id: "1",
          email: "admin@radiologyai.com",
          full_name: "System Administrator",
          role: "admin",
          department: "IT",
          is_active: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          email: "dr.smith@hospital.com",
          full_name: "Dr. Sarah Smith",
          role: "radiologist",
          department: "Radiology",
          is_active: true,
          created_at: "2024-01-02T00:00:00Z",
          updated_at: "2024-01-02T00:00:00Z",
        },
        {
          id: "3",
          email: "dr.johnson@hospital.com",
          full_name: "Dr. Michael Johnson",
          role: "reviewer",
          department: "Radiology",
          is_active: true,
          created_at: "2024-01-03T00:00:00Z",
          updated_at: "2024-01-03T00:00:00Z",
        },
      ]
    }

    try {
      const { data, error } = await this.client
        .from("users")
        .select("*")
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
    if (!this.client) {
      // Return mock report for development
      return {
        id: `report-${Date.now()}`,
        ...reportData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

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
    if (!this.client) {
      // Return mock report for development
      return {
        id,
        patient_id: "DEMO-001",
        study_type: "Chest X-Ray",
        report_text: "Demo radiology report for testing purposes.",
        radiologist_id: "demo-radiologist",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

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
    if (!this.client) {
      // Return mock reports for development
      return [
        {
          id: "demo-report-1",
          patient_id: "DEMO-001",
          study_type: "Chest X-Ray",
          report_text: "Chest X-ray shows clear lung fields with no acute abnormalities.",
          radiologist_id: "demo-radiologist",
          status: "reviewed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "demo-report-2",
          patient_id: "DEMO-002",
          study_type: "CT Abdomen",
          report_text: "CT abdomen demonstrates normal organ enhancement with no masses identified.",
          radiologist_id: "demo-radiologist",
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    }

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
    if (!this.client) {
      // Return mock analysis for development
      return {
        id: `analysis-${Date.now()}`,
        ...analysisData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

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
    if (!this.client) {
      // Return mock analysis for development
      return {
        id: `analysis-${reportId}`,
        report_id: reportId,
        confidence: 0.85,
        risk_level: "medium",
        findings: ["Normal chest X-ray", "No acute abnormalities"],
        potential_false_findings: [],
        recommendations: ["Continue routine monitoring", "Follow up in 6 months"],
        summary: "Overall normal study with no significant findings requiring immediate attention.",
        medical_relevance_score: 0.75,
        discrepancies: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

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
    if (!this.client) {
      // Return mock analytics for development
      return {
        totalReports: 156,
        analyzedReports: 142,
        flaggedReports: 8,
        averageConfidence: 0.87,
        riskDistribution: {
          low: 89,
          medium: 45,
          high: 6,
          critical: 2,
        },
        recentActivity: [
          { date: "2024-01-15", reports: 12, flagged: 1 },
          { date: "2024-01-14", reports: 8, flagged: 0 },
          { date: "2024-01-13", reports: 15, flagged: 2 },
        ],
      }
    }

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
          acc[a.risk_level] = (acc[a.risk_level] || 0) + 1
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
    if (!this.client) {
      return false
    }

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

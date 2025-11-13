import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "radiologist" | "reviewer" | "resident"
          department: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role: "admin" | "radiologist" | "reviewer" | "resident"
          department: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "admin" | "radiologist" | "reviewer" | "resident"
          department?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      radiology_reports: {
        Row: {
          id: string
          patient_id: string
          study_type: string
          report_text: string
          radiologist_id: string
          created_at: string
          updated_at: string
          status: "pending" | "reviewed" | "approved" | "flagged"
        }
        Insert: {
          id?: string
          patient_id: string
          study_type: string
          report_text: string
          radiologist_id: string
          created_at?: string
          updated_at?: string
          status?: "pending" | "reviewed" | "approved" | "flagged"
        }
        Update: {
          id?: string
          patient_id?: string
          study_type?: string
          report_text?: string
          radiologist_id?: string
          created_at?: string
          updated_at?: string
          status?: "pending" | "reviewed" | "approved" | "flagged"
        }
      }
      analysis_results: {
        Row: {
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
        Insert: {
          id?: string
          report_id: string
          confidence: number
          risk_level: "low" | "medium" | "high" | "critical"
          findings: string[]
          potential_false_findings?: any[]
          recommendations: string[]
          summary: string
          medical_relevance_score: number
          discrepancies?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          confidence?: number
          risk_level?: "low" | "medium" | "high" | "critical"
          findings?: string[]
          potential_false_findings?: any[]
          recommendations?: string[]
          summary?: string
          medical_relevance_score?: number
          discrepancies?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

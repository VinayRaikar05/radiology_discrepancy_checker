import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function assertEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `${name} is not defined. Set it in your environment (see .env.example) and restart the dev server.`,
    )
  }
  return value
}

const resolvedSupabaseUrl = assertEnv("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl)
const resolvedSupabaseAnonKey = assertEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)
const resolvedSupabaseServiceKey = assertEnv("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceKey)

// Client-side Supabase client
export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey)

// Server-side Supabase client with service role
export function createServerClient() {
  return createClient(resolvedSupabaseUrl, resolvedSupabaseServiceKey)
}

/**
 * Lazily create and return a Supabase client for server-side usage.
 * This prevents reading env vars at module import time (which breaks Next build/page-data collection
 * when env vars are not present in the build environment).
 *
 * Throws a clear error if required env vars are missing.
 */
export function getSupabaseForServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer the server-side service key for privileged operations; fallback to anon if you only have anon.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not defined. Set NEXT_PUBLIC_SUPABASE_URL in your environment.'
    );
  }
  if (!key) {
    throw new Error(
      'Supabase key is not defined. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
    );
  }

  return createClient(url, key, {
    // Ensure server-side defaults, adjust if needed.
    auth: { persistSession: false }
  });
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

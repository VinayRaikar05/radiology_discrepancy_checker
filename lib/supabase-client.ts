import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export interface Patient {
  id: string
  patient_id: string
  first_name?: string
  last_name?: string
  date_of_birth?: string
  gender?: string
  created_at: string
  updated_at: string
}

export interface Study {
  id: string
  patient_id: string
  radiologist_id?: string
  study_type: string
  study_date: string
  modality: string
  body_part?: string
  clinical_history?: string
  status: string
  priority: string
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  id: string
  study_id: string
  report_id?: string
  analysis_type: string
  risk_level: string
  confidence_score: number
  findings: any
  discrepancies: any
  ml_metrics: any
  processing_time_ms?: number
  model_version?: string
  created_at: string
}

export interface CollaborationSession {
  id: string
  study_id: string
  initiator_id: string
  participants: string[]
  status: string
  created_at: string
  updated_at: string
}

export interface Annotation {
  id: string
  session_id: string
  type: string
  coordinates: any
  text?: string
  author_id: string
  image_id?: string
  created_at: string
}

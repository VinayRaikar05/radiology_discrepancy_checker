import { supabase } from "./supabase-client"
import type { Patient, Study, AIAnalysis, CollaborationSession } from "./supabase-client"

export class DatabaseService {
  // Patient operations
  static async createPatient(patientData: Partial<Patient>) {
    const { data: patient, error } = await supabase.from("patients").insert(patientData).select().single()

    if (error) throw error
    return patient
  }

  static async getPatient(patientId: string) {
    const { data: patient, error } = await supabase.from("patients").select("*").eq("patient_id", patientId).single()

    if (error) throw error
    return patient
  }

  // Study operations
  static async createStudy(studyData: Partial<Study>) {
    const { data: study, error } = await supabase.from("studies").insert(studyData).select().single()

    if (error) throw error
    return study
  }

  static async getStudiesByPatient(patientId: string) {
    const { data: studies, error } = await supabase
      .from("studies")
      .select(`
        *,
        patients(*),
        reports(*),
        ai_analysis(*),
        medical_images(*)
      `)
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return studies
  }

  // AI Analysis operations
  static async saveAIAnalysis(analysisData: Partial<AIAnalysis>) {
    const { data: aiAnalysis, error } = await supabase.from("ai_analysis").insert(analysisData).select().single()

    if (error) throw error
    return aiAnalysis
  }

  static async getAIAnalysis(studyId: string) {
    const { data: aiAnalysis, error } = await supabase
      .from("ai_analysis")
      .select("*")
      .eq("study_id", studyId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return aiAnalysis
  }

  // Collaboration operations
  static async createCollaborationSession(sessionData: Partial<CollaborationSession>) {
    const { data: collaborationSession, error } = await supabase
      .from("collaboration_sessions")
      .insert(sessionData)
      .select()
      .single()

    if (error) throw error
    return collaborationSession
  }

  static async getActiveCollaborations(userId: string) {
    const { data: activeCollaborations, error } = await supabase
      .from("collaboration_sessions")
      .select(`
        *,
        studies(*),
        annotations(*),
        comments(*)
      `)
      .or(`initiator_id.eq.${userId},participants.cs.{${userId}}`)
      .eq("status", "active")

    if (error) throw error
    return activeCollaborations
  }

  // Performance analytics
  static async getPerformanceMetrics(radiologistId: string, startDate: string, endDate: string) {
    const { data: performanceMetrics, error } = await supabase
      .from("performance_analytics")
      .select("*")
      .eq("radiologist_id", radiologistId)
      .gte("period_start", startDate)
      .lte("period_end", endDate)

    if (error) throw error
    return performanceMetrics
  }

  // Notifications
  static async createNotification(userId: string, type: string, title: string, message: string, data?: any) {
    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
      })
      .select()
      .single()

    if (error) throw error
    return notification
  }

  static async getUserNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (unreadOnly) {
      query = query.eq("read", false)
    }

    const { data: notifications, error } = await query
    if (error) throw error
    return notifications
  }

  // Audit logging
  static async logAction(userId: string, action: string, resourceType: string, resourceId?: string, details?: any) {
    const { data: auditLog, error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    })

    if (error) console.error("Audit log error:", error)
    return auditLog
  }
}

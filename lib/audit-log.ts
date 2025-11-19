import { getSupabaseForServer } from "@/lib/supabase"

export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.create"
  | "user.update"
  | "user.delete"
  | "user.deactivate"
  | "report.create"
  | "report.update"
  | "report.delete"
  | "report.analyze"
  | "report.flag"
  | "report.approve"
  | "analysis.create"
  | "analysis.update"
  | "analysis.delete"
  | "export.data"
  | "settings.update"

export type EntityType = "user" | "report" | "analysis" | "system"

export interface AuditLogEntry {
  user_id?: string
  action: AuditAction
  entity_type: EntityType
  entity_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export class AuditLogService {
  private client = getSupabaseForServer()

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.client.from("audit_logs").insert({
        user_id: entry.user_id || null,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        details: entry.details || {},
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
      })
    } catch (error) {
      // Don't throw - audit logging should never break the main flow
      console.error("Audit log error:", error)
    }
  }

  async getLogs(filters?: {
    userId?: string
    action?: AuditAction
    entityType?: EntityType
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) {
    try {
      let query = this.client.from("audit_logs").select("*").order("created_at", { ascending: false })

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId)
      }

      if (filters?.action) {
        query = query.eq("action", filters.action)
      }

      if (filters?.entityType) {
        query = query.eq("entity_type", filters.entityType)
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset || 0) + (filters.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching audit logs:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Database error:", error)
      return []
    }
  }

  async getLogCount(filters?: {
    userId?: string
    action?: AuditAction
    entityType?: EntityType
    startDate?: string
    endDate?: string
  }) {
    try {
      let query = this.client.from("audit_logs").select("*", { count: "exact", head: true })

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId)
      }

      if (filters?.action) {
        query = query.eq("action", filters.action)
      }

      if (filters?.entityType) {
        query = query.eq("entity_type", filters.entityType)
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate)
      }

      const { count, error } = await query

      if (error) {
        console.error("Error counting audit logs:", error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error("Database error:", error)
      return 0
    }
  }
}

export const auditLogService = new AuditLogService()

// Helper function to get client IP and user agent from request
export function getRequestMetadata(request: Request) {
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"

  const userAgent = request.headers.get("user-agent") || "unknown"

  return { ipAddress, userAgent }
}


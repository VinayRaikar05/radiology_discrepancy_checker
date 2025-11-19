import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { auditLogService } from "@/lib/audit-log"
import { getRequestMetadata } from "@/lib/audit-log"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can view audit logs
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const action = searchParams.get("action")
    const entityType = searchParams.get("entityType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const logs = await auditLogService.getLogs({
      userId: userId || undefined,
      action: action as any,
      entityType: entityType as any,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit,
      offset,
    })

    const total = await auditLogService.getLogCount({
      userId: userId || undefined,
      action: action as any,
      entityType: entityType as any,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Audit logs fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


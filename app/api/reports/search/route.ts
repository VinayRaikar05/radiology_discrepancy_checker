import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { databaseService } from "@/lib/database"
import { getSupabaseForServer } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const studyType = searchParams.get("studyType")
    const status = searchParams.get("status")
    const riskLevel = searchParams.get("riskLevel")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const supabase = getSupabaseForServer()

    // Build query
    let reportsQuery = supabase
      .from("radiology_reports")
      .select("*, analysis_results(*)")
      .order("created_at", { ascending: false })

    // Text search in report_text
    if (query) {
      reportsQuery = reportsQuery.ilike("report_text", `%${query}%`)
    }

    // Filter by study type
    if (studyType) {
      reportsQuery = reportsQuery.eq("study_type", studyType)
    }

    // Filter by status
    if (status) {
      reportsQuery = reportsQuery.eq("status", status)
    }

    // Filter by date range
    if (startDate) {
      reportsQuery = reportsQuery.gte("created_at", startDate)
    }
    if (endDate) {
      reportsQuery = reportsQuery.lte("created_at", endDate)
    }

    // Apply pagination
    reportsQuery = reportsQuery.range(offset, offset + limit - 1)

    const { data: reports, error: reportsError } = await reportsQuery

    if (reportsError) {
      console.error("Search error:", reportsError)
      return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }

    // Filter by risk level if provided (requires joining with analysis_results)
    let filteredReports = reports || []
    if (riskLevel) {
      filteredReports = filteredReports.filter((report: any) => {
        const analysis = report.analysis_results?.[0]
        return analysis?.risk_level === riskLevel
      })
    }

    // Get total count for pagination
    let countQuery = supabase.from("radiology_reports").select("*", { count: "exact", head: true })

    if (query) {
      countQuery = countQuery.ilike("report_text", `%${query}%`)
    }
    if (studyType) {
      countQuery = countQuery.eq("study_type", studyType)
    }
    if (status) {
      countQuery = countQuery.eq("status", status)
    }
    if (startDate) {
      countQuery = countQuery.gte("created_at", startDate)
    }
    if (endDate) {
      countQuery = countQuery.lte("created_at", endDate)
    }

    const { count } = await countQuery

    return NextResponse.json({
      reports: filteredReports,
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

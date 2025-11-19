import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { databaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range from query params if provided
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined

    const analytics = await databaseService.getAnalytics(dateRange)
    if (!analytics) {
      return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

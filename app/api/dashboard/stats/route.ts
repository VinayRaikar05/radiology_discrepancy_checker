import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { databaseService } from "@/lib/database"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analytics = await databaseService.getAnalytics()
    if (!analytics) {
      return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock data for demonstration
    // In a real application, this would fetch from your database
    const stats = {
      totalReports: 1247,
      flaggedReports: 89,
      accuracyRate: 94.7,
      avgProcessingTime: 12,
      recentActivity: [
        {
          id: "1",
          type: "report_analyzed",
          description: "Chest X-ray report analyzed - No false findings detected",
          timestamp: "2 minutes ago",
          status: "success" as const,
        },
        {
          id: "2",
          type: "report_flagged",
          description: "MRI Brain report flagged for review - Potential inconsistency found",
          timestamp: "15 minutes ago",
          status: "warning" as const,
        },
        {
          id: "3",
          type: "report_reviewed",
          description: "CT Abdomen report review completed by Dr. Johnson",
          timestamp: "1 hour ago",
          status: "success" as const,
        },
        {
          id: "4",
          type: "system_update",
          description: "AI model updated with latest medical guidelines",
          timestamp: "3 hours ago",
          status: "success" as const,
        },
        {
          id: "5",
          type: "report_analyzed",
          description: "Ultrasound report processed - High confidence score",
          timestamp: "4 hours ago",
          status: "success" as const,
        },
      ],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

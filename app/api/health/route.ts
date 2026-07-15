import { NextResponse } from "next/server"
import { databaseService } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET() {
  const startTime = Date.now()

  try {
    const dbHealthy = await databaseService.healthCheck()
    const responseTime = Date.now() - startTime

    if (!dbHealthy) {
      return NextResponse.json(
        {
          status: "degraded",
          timestamp: new Date().toISOString(),
          checks: {
            database: { status: "unhealthy", responseTimeMs: responseTime },
            application: { status: "healthy" },
          },
        },
        { status: 503 },
      )
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      checks: {
        database: { status: "healthy", responseTimeMs: responseTime },
        application: { status: "healthy" },
        ai: {
          status: process.env.GROQ_API_KEY ? "configured" : "not_configured",
        },
        email: {
          status: process.env.SMTP_HOST ? "configured" : "not_configured",
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}

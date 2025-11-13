import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase.from("users").select("count").limit(1)

    if (connectionError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: connectionError.message,
        },
        { status: 500 },
      )
    }

    // Test table existence and get counts
    const tables = ["users", "radiology_reports", "analysis_results"]
    const results = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })

        if (error) {
          results[table] = { exists: false, error: error.message, count: 0 }
        } else {
          results[table] = { exists: true, error: null, count: count || 0 }
        }
      } catch (err) {
        results[table] = {
          exists: false,
          error: err instanceof Error ? err.message : "Unknown error",
          count: 0,
        }
      }
    }

    // Check if all required tables exist
    const allTablesExist = tables.every((table) => results[table].exists)

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist ? "All database tables are properly configured" : "Some database tables are missing",
      details: {
        connection: "OK",
        tables: results,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { url, serviceKey } = await request.json()

    if (!url || !serviceKey) {
      return NextResponse.json({ error: "URL and service key are required" }, { status: 400 })
    }

    // Test with provided credentials
    const { createClient } = await import("@supabase/supabase-js")
    const testSupabase = createClient(url, serviceKey)

    const { data, error } = await testSupabase.from("users").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Connection failed with provided credentials",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful with provided credentials",
      details: { connection: "OK", timestamp: new Date().toISOString() },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

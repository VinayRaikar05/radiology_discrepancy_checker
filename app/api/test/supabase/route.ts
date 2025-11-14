import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase configuration missing",
          details: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
          },
        },
        { status: 500 },
      )
    }

    // Test Supabase connection
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase connection failed",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: {
        connection: "OK",
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Supabase test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Supabase test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { url, anonKey } = await request.json()

    if (!url || !anonKey) {
      return NextResponse.json({ error: "URL and anon key are required" }, { status: 400 })
    }

    // Test with provided credentials
    const { createClient } = await import("@supabase/supabase-js")
    const testSupabase = createClient(url, anonKey)

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
      message: "Supabase connection successful with provided credentials",
      details: { connection: "OK", timestamp: new Date().toISOString() },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

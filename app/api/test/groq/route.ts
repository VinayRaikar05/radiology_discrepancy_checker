import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Groq API key not configured",
          details: "GROQ_API_KEY environment variable is missing",
        },
        { status: 500 },
      )
    }

    // Test Groq API connection
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Groq API connection failed",
          details: `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Groq API connection successful",
      details: {
        modelsAvailable: data.data?.length || 0,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Groq API test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Groq API test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Test with provided API key
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key or connection failed",
          details: `HTTP ${response.status}: ${response.statusText}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Groq API key is valid",
      details: {
        modelsAvailable: data.data?.length || 0,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "API key test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notificationService } from "@/lib/notifications"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can test email
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const testEmail = searchParams.get("email") || session.user?.email

    if (!testEmail) {
      return NextResponse.json({ error: "No email address provided" }, { status: 400 })
    }

    const result = await notificationService.sendEmail({
      to: testEmail,
      subject: "RadiologyAI - Email Configuration Test",
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email from RadiologyAI to verify your SMTP configuration.</p>
        <p>If you received this email, your SMTP settings are working correctly!</p>
        <hr>
        <p><small>Sent at: ${new Date().toISOString()}</small></p>
      `,
    })

    return NextResponse.json({
      success: result,
      message: result
        ? `Test email sent successfully to ${testEmail}`
        : "Email configuration missing or failed. Check your SMTP settings.",
      email: testEmail,
    })
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to send test email. Check server logs for details.",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, subject, message } = body

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    const result = await notificationService.sendEmail({
      to: email,
      subject: subject || "RadiologyAI - Custom Test Email",
      html: message || "<p>This is a custom test email.</p>",
    })

    return NextResponse.json({
      success: result,
      message: result ? `Email sent successfully to ${email}` : "Email sending failed",
    })
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}


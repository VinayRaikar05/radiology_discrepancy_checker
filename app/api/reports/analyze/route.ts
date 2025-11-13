import { type NextRequest, NextResponse } from "next/server"
import { medicalAIEngine } from "@/lib/medical-ai-engine"
import { databaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { reportText, reportId, patientId, studyType } = await request.json()

    if (!reportText || typeof reportText !== "string") {
      return NextResponse.json({ error: "Report text is required and must be a string" }, { status: 400 })
    }

    // Validate content
    const isValidContent = await medicalAIEngine.validateMedicalContent(reportText)
    if (!isValidContent) {
      return NextResponse.json(
        { error: "Invalid medical content. Please provide a valid radiology report." },
        { status: 400 },
      )
    }

    // Create or get report record
    let report = null
    if (reportId) {
      report = await databaseService.getReport(reportId)
    } else if (patientId && studyType) {
      // Create new report
      report = await databaseService.createReport({
        patient_id: patientId,
        study_type: studyType,
        report_text: reportText,
        status: "pending",
      })
    }

    // Perform AI analysis
    const analysis = await medicalAIEngine.analyzeRadiologyReport(reportText)

    // Save analysis results if we have a report
    let savedAnalysis = null
    if (report?.id) {
      savedAnalysis = await databaseService.createAnalysis({
        report_id: report.id,
        ...analysis,
      })
    }

    // Generate additional insights
    const [summary, anomalies] = await Promise.all([
      medicalAIEngine.generateMedicalSummary(reportText),
      medicalAIEngine.detectAnomalies(reportText),
    ])

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        summary: summary || analysis.summary,
        anomalies: anomalies || [],
      },
      report: report
        ? {
            id: report.id,
            patient_id: report.patient_id,
            study_type: report.study_type,
            status: report.status,
          }
        : null,
      analysisId: savedAnalysis?.id || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Analysis error:", error)

    // Provide detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const isAIError = errorMessage.includes("AI") || errorMessage.includes("model")
    const isDatabaseError = errorMessage.includes("database") || errorMessage.includes("Database")

    return NextResponse.json(
      {
        error: "Analysis failed",
        details: errorMessage,
        type: isAIError ? "ai_error" : isDatabaseError ? "database_error" : "general_error",
        timestamp: new Date().toISOString(),
        // Provide fallback analysis for critical errors
        fallback:
          error instanceof Error && error.message.includes("AI")
            ? {
                confidence: 0.5,
                risk_level: "medium",
                findings: ["Manual review required due to AI processing error"],
                recommendations: ["Please review report manually", "Consider re-running analysis"],
                summary: "Automated analysis unavailable - manual review recommended",
              }
            : null,
      },
      { status: 500 },
    )
  }
}

// GET endpoint for retrieving existing analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("reportId")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    const analysis = await databaseService.getAnalysis(reportId)

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error retrieving analysis:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

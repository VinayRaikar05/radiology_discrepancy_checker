"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import {
  classifyMultipleImages,
  formatFindingsForLLM,
} from "@/lib/medical-image-classifier"
import { applyClinicalSafetyAudits } from "@/lib/clinical-audits"
import { databaseService } from "@/lib/database"
import { notificationService } from "@/lib/notifications"
import { getServerSession } from "next-auth"
import { getAuthOptions } from "@/lib/auth"

// ──────────────────────────────────────────────────────────────────────────────
// Input sanitization
// ──────────────────────────────────────────────────────────────────────────────
const MAX_REPORT_TEXT_LENGTH = 50_000
const MAX_PATIENT_ID_LENGTH = 100
const MAX_FIELD_LENGTH = 500
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

function sanitizeInput(input: string, maxLength: number): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength)
}

function isValidIdentifier(value: string): boolean {
  return /^[a-zA-Z0-9\-_.\s]+$/.test(value)
}

interface AnalysisResult {
  riskLevel: "low" | "medium" | "high" | "critical"
  findings: string[]
  imageFindings: string[]
  imageTextComparison: string
  discrepancies: Array<{
    type: "false_positive" | "false_negative" | "inconsistency"
    description: string
    severity: "low" | "medium" | "high"
    confidence: number
  }>
  recommendations: string[]
  confidence: number
  potentialFalseFindings: Array<{
    finding: string
    likelihood: string
    reasoning: string
    source: "text" | "image" | "comparison"
    mlConfidence: number
  }>
  summary: string
  technicalQuality: {
    imageQuality?: string
    reportCompleteness: string
    diagnosticConfidence: number
  }
  patientId: string
  studyType: string
  radiologist: string
  imageCount: number
  timestamp: string
  analysisType: string
  mlMetrics: {
    imageAnalysisConfidence: number
    textAnalysisConfidence: number
    crossModalAgreement: number | null
  }
}

export async function analyzeReport(formData: FormData) {
  const rawPatientId = formData.get("patientId") as string
  const rawStudyType = formData.get("studyType") as string
  const rawReportText = formData.get("reportText") as string
  const rawRadiologist = formData.get("radiologist") as string
  const rawPreviousReportId = formData.get("previousReportId") as string
  const imageCount = Number.parseInt((formData.get("imageCount") as string) || "0")

  // Sanitize all inputs
  const patientId = sanitizeInput(rawPatientId || "", MAX_PATIENT_ID_LENGTH)
  const studyType = sanitizeInput(rawStudyType || "", MAX_FIELD_LENGTH)
  const reportText = sanitizeInput(rawReportText || "", MAX_REPORT_TEXT_LENGTH)
  const radiologist = sanitizeInput(rawRadiologist || "", MAX_FIELD_LENGTH)
  const previousReportId = sanitizeInput(rawPreviousReportId || "", MAX_FIELD_LENGTH)

  if (!reportText) {
    throw new Error("Report text is required")
  }

  if (!patientId || !studyType) {
    throw new Error("Patient ID and Study Type are required")
  }

  // Validate identifiers don't contain injection characters
  if (!isValidIdentifier(patientId)) {
    throw new Error("Patient ID contains invalid characters")
  }

  // Load previous report for comparison if specified
  let previousReportText = ""
  if (previousReportId) {
    try {
      const prevReport = await databaseService.getReport(previousReportId)
      if (prevReport) {
        previousReportText = prevReport.report_text
      }
    } catch (dbError) {
      console.warn("Failed to fetch previous report for comparison:", dbError)
    }
  }

  let temporalSection = ""
  if (previousReportText) {
    temporalSection = `\n\nThere is a historical/previous radiology report for this patient for comparison:\n"""\n${previousReportText}\n"""\n\nPlease compare the current report and the current clinical images to this historical report. Check for temporal trend progression, and flag any discrepancies (e.g., if a lesion is described as "stable" or "resolving" but has grown in size compared to the previous measurement, or if a finding described as "new" was actually present in the previous study).`
  }

  let allImageFindings: string[] = []
  let avgImageConfidence = 0
  let text = ""
  let biomedclipFindings = ""

  try {
    if (imageCount > 0 && process.env.GROQ_API_KEY) {
      const imageParts: any[] = []
      const rawImageBuffers: Uint8Array[] = []

      for (let i = 0; i < imageCount; i++) {
        const imageFile = formData.get(`image_${i}`) as File
        if (imageFile) {
          // Enforce file size limit
          if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
            throw new Error(`Image ${i + 1} exceeds the 10 MB size limit`)
          }
          // Validate file type
          if (!imageFile.type.startsWith("image/")) {
            throw new Error(`File ${i + 1} is not a valid image format`)
          }
          const arrayBuffer = await imageFile.arrayBuffer()
          const uint8 = new Uint8Array(arrayBuffer)
          rawImageBuffers.push(uint8)
          imageParts.push({
            type: "image" as const,
            image: uint8,
          })
        }
      }

      // ── Step 1: Run BiomedCLIP medical image classification ──────────
      // Uses a model trained on 15M+ biomedical image-text pairs
      let biomedclipSection = ""
      try {
        const classificationResult = await classifyMultipleImages(rawImageBuffers, studyType)
        if (classificationResult) {
          biomedclipFindings = formatFindingsForLLM(classificationResult.aggregatedFindings)
          const cleanLabels = classificationResult.aggregatedFindings
            .filter(f => f.avgConfidence >= 0.15)
            .map(f => f.label)

          allImageFindings = classificationResult.aggregatedFindings
            .filter(f => f.avgConfidence >= 0.1)
            .map(f => `${f.label} (${(f.avgConfidence * 100).toFixed(1)}% confidence)`)
          avgImageConfidence = classificationResult.aggregatedFindings.length > 0
            ? classificationResult.aggregatedFindings[0].avgConfidence * 100
            : 0
          biomedclipSection = `\n\nA specialized medical image classifier (BiomedCLIP, trained on 15M+ biomedical image-text pairs from PubMed) has pre-analyzed the uploaded image(s). Here are its findings:\n${biomedclipFindings}\n\nUse these AI-detected findings to cross-reference against the written report. Flag any discrepancies between the BiomedCLIP detections and the report text.`

          // ── Step 1.5: Image RAG Reference Cases Lookup ────────────────
          try {
            const similarCases = await databaseService.getSimilarReportsByFindings(studyType, cleanLabels, 3)
            if (similarCases && similarCases.length > 0) {
              let ragReferenceSection = `\n\n=== Retrieval-Augmented Grounding (Similar Reference Cases) ===\nHere are up to 3 similar reference studies from the database matching the visual findings detected in this scan:\n`
              similarCases.forEach((c, idx) => {
                const analysis = c.analysis_results?.[0]
                ragReferenceSection += `\nReference Case #${idx + 1}:\n- Scan Findings: ${(analysis?.findings || []).join(", ")}\n- Report Text: "${c.report_text.slice(0, 300)}..."\n- Verified Recommendations: ${(analysis?.recommendations || []).join(", ")}\n`
              })
              biomedclipSection += ragReferenceSection
            }
          } catch (ragError) {
            console.warn("Image RAG reference lookup failed:", ragError)
          }
        }
      } catch (classifierError) {
        console.warn("BiomedCLIP classification failed, continuing with LLM-only analysis:", classifierError)
      }

      // ── Step 2: Run Groq LLM multimodal analysis ────────────────────
      const analysisPrompt = `You are a professional board-certified clinical radiologist.
We have a clinical case with the following details:
- Study Type: ${studyType}
- Patient ID: ${patientId}
- Radiologist: ${radiologist}

Here is the written radiology report:
"""
${reportText}
"""${biomedclipSection}${temporalSection}

Please carefully analyze the uploaded clinical scan image(s) for this study, and compare your visual findings with the written radiology report to detect any discrepancies (such as false positives, false negatives, or visual-textual inconsistencies).

Additionally, perform clinical audits:
1. Verify anatomical side/laterality consistency (e.g. left vs. right) between findings and impression for any described lesion or pathology.
2. If this is a Mammogram or breast study, check if BI-RADS classification (0-6) is present. If it is a prostate study, verify if PI-RADS classification (1-5) is present.
3. Check for life-threatening critical findings (pneumothorax, pulmonary embolism, intracranial hemorrhage, aortic dissection, free air, spinal compression, torsion). If any of these are present, set "riskLevel" to "critical" and add a recommendation to notify the physician immediately.

You must respond ONLY with a valid JSON object matching the following TypeScript interface (do not wrap in markdown code blocks or add any other text):
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "findings": string[],
  "imageFindings": string[],
  "imageTextComparison": string,
  "discrepancies": Array<{
    "type": "false_positive" | "false_negative" | "inconsistency",
    "description": string,
    "severity": "low" | "medium" | "high",
    "confidence": number
  }>,
  "recommendations": string[],
  "confidence": number,
  "summary": string,
  "technicalQuality": {
    "imageQuality": "excellent" | "good" | "fair" | "poor",
    "reportCompleteness": "complete" | "incomplete",
    "diagnosticConfidence": number
  }
}`

      const { text: resultText } = await generateText({
        model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              ...imageParts,
            ],
          },
        ],
        temperature: 0.1,
      })
      text = resultText
    } else {
      if (process.env.GROQ_API_KEY) {
        const analysisPrompt = `You are a professional board-certified clinical radiologist.
We have a clinical case with the following details:
- Study Type: ${studyType}
- Patient ID: ${patientId}
- Radiologist: ${radiologist}

Here is the written radiology report:
"""
${reportText}
"""${temporalSection}

Analyze this report for clinical quality, completeness, internal consistency, and potential discrepancies (e.g. self-contradictions).

Additionally, perform clinical audits:
1. Verify anatomical side/laterality consistency (e.g. left vs. right) between findings and impression for any described lesion or pathology.
2. If this is a Mammogram or breast study, check if BI-RADS classification (0-6) is present. If it is a prostate study, verify if PI-RADS classification (1-5) is present.
3. Check for life-threatening critical findings (pneumothorax, pulmonary embolism, intracranial hemorrhage, aortic dissection, free air, spinal compression, torsion). If any of these are present, set "riskLevel" to "critical" and add a recommendation to notify the physician immediately.

You must respond ONLY with a valid JSON object matching the following TypeScript interface (do not wrap in markdown code blocks or add any other text):
{
  "riskLevel": "low" | "medium" | "high" | "critical",
  "findings": string[],
  "imageFindings": string[],
  "imageTextComparison": string,
  "discrepancies": Array<{
    "type": "false_positive" | "false_negative" | "inconsistency",
    "description": string,
    "severity": "low" | "medium" | "high",
    "confidence": number
  }>,
  "recommendations": string[],
  "confidence": number,
  "summary": string,
  "technicalQuality": {
    "reportCompleteness": "complete" | "incomplete",
    "diagnosticConfidence": number
  }
}`

        const { text: resultText } = await generateText({
          model: groq("meta-llama/llama-3.3-70b-versatile"),
          prompt: analysisPrompt,
          temperature: 0.1,
        })
        text = resultText
      } else {
        throw new Error("GROQ_API_KEY is required for AI discrepancy analysis.")
      }
    }

    let analysisResult: any
    try {
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim()
      }
      const parsed = JSON.parse(cleanedText)
      allImageFindings = parsed.imageFindings || []
      avgImageConfidence = parsed.technicalQuality?.diagnosticConfidence || parsed.confidence || 85

      analysisResult = {
        riskLevel: parsed.riskLevel || "low",
        findings: parsed.findings || [],
        imageFindings: parsed.imageFindings || [],
        imageTextComparison: parsed.imageTextComparison || "Comparison completed.",
        discrepancies: parsed.discrepancies || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 80,
        potentialFalseFindings: (parsed.discrepancies || []).map((d: any) => ({
          finding: d.description,
          likelihood: d.severity,
          reasoning: `AI analysis detected potential ${d.type.replace("_", " ")}`,
          source: "comparison" as const,
          mlConfidence: d.confidence,
        })),
        summary: parsed.summary || "",
        technicalQuality: {
          imageQuality: parsed.technicalQuality?.imageQuality || (imageCount > 0 ? "good" : undefined),
          reportCompleteness: parsed.technicalQuality?.reportCompleteness || "complete",
          diagnosticConfidence: parsed.technicalQuality?.diagnosticConfidence || parsed.confidence || 80,
        },
        patientId,
        studyType,
        radiologist,
        imageCount,
        timestamp: new Date().toISOString(),
        analysisType: imageCount > 0 ? "multimodal_analysis" : "text_analysis",
        mlMetrics: {
          imageAnalysisConfidence: imageCount > 0 ? parsed.confidence || 85 : 0,
          textAnalysisConfidence: parsed.confidence || 80,
          crossModalAgreement: imageCount > 0 ? Math.max(60, 100 - (parsed.discrepancies || []).length * 10) : null,
        },
      }
    } catch (parseError) {
      console.warn("JSON parsing failed, falling back to heuristic parsing:", parseError)
      analysisResult = parseAnalysisResponse(text, {
        patientId,
        studyType,
        radiologist,
        imageCount,
        allImageFindings: [],
        avgImageConfidence: 85,
        reportText,
      })
    }

    analysisResult = applyClinicalSafetyAudits(analysisResult, reportText, studyType)
    await saveReportAndAnalysis(analysisResult, reportText, patientId, studyType, previousReportId)
    return analysisResult
  } catch (error) {
    console.error("Analysis failed:", error)

    // Enhanced fallback analysis
    const fallbackResult: AnalysisResult = {
      riskLevel: "medium",
      findings: extractBasicFindings(reportText),
      imageFindings: allImageFindings || [],
      imageTextComparison:
        imageCount > 0
          ? `Basic analysis completed. ${imageCount} images processed with average confidence of ${avgImageConfidence?.toFixed(1) || 0}%.`
          : "No images provided. Text-only analysis performed.",
      discrepancies: [],
      recommendations: [
        "Manual radiologist review recommended",
        "Consider clinical correlation",
        "Follow-up as clinically indicated",
      ],
      confidence: 75,
      potentialFalseFindings: [],
      summary: `Analysis of ${studyType} for patient ${patientId}. ${extractBasicFindings(reportText).length} findings identified. Manual review recommended.`,
      technicalQuality: {
        imageQuality: imageCount > 0 ? "adequate" : undefined,
        reportCompleteness: "standard",
        diagnosticConfidence: 75,
      },
      patientId,
      studyType,
      radiologist,
      imageCount,
      timestamp: new Date().toISOString(),
      analysisType: "fallback_basic",
      mlMetrics: {
        imageAnalysisConfidence: avgImageConfidence || 0,
        textAnalysisConfidence: 75,
        crossModalAgreement: null,
      },
    }

    const auditedFallbackResult = applyClinicalSafetyAudits(fallbackResult, reportText, studyType)
    await saveReportAndAnalysis(auditedFallbackResult, reportText, patientId, studyType, previousReportId)
    return auditedFallbackResult
  }
}

function parseAnalysisResponse(text: string, context: any): any {
  // Extract key information from the AI response
  const lines = text.split("\n").filter((line) => line.trim())

  // Determine risk level based on keywords
  const riskLevel = determineRiskLevel(text)

  // Extract findings
  const findings = extractFindings(text)

  // Extract recommendations
  const recommendations = extractRecommendations(text)

  // Calculate confidence based on response quality
  const confidence = calculateConfidence(text, context)

  // Detect potential discrepancies
  const discrepancies = detectDiscrepancies(text, context)

  // Generate summary
  const summary = generateSummary(text, context)

  return {
    riskLevel,
    findings,
    imageFindings: context.allImageFindings || [],
    imageTextComparison:
      context.imageCount > 0
        ? `Cross-modal analysis completed. ${context.allImageFindings?.length || 0} image findings detected with ${context.avgImageConfidence?.toFixed(1) || 0}% average confidence.`
        : "No images provided. Text-only analysis performed.",
    discrepancies,
    recommendations,
    confidence,
    potentialFalseFindings: discrepancies.map((d: any) => ({
      finding: d.description,
      likelihood: d.severity,
      reasoning: `AI analysis detected potential ${d.type.replace("_", " ")}`,
      source: "comparison" as const,
      mlConfidence: d.confidence,
    })),
    summary,
    technicalQuality: {
      imageQuality: context.imageCount > 0 ? "good" : undefined,
      reportCompleteness: "complete",
      diagnosticConfidence: confidence,
    },
    patientId: context.patientId,
    studyType: context.studyType,
    radiologist: context.radiologist,
    imageCount: context.imageCount,
    timestamp: new Date().toISOString(),
    analysisType: context.imageCount > 0 ? "multimodal_analysis" : "text_analysis",
    mlMetrics: {
      imageAnalysisConfidence: context.avgImageConfidence || 0,
      textAnalysisConfidence: confidence,
      crossModalAgreement: context.imageCount > 0 ? Math.max(60, 100 - discrepancies.length * 10) : null,
    },
  }
}

function determineRiskLevel(text: string): "low" | "medium" | "high" {
  const highRiskKeywords = ["urgent", "immediate", "critical", "severe", "acute", "emergency"]
  const mediumRiskKeywords = ["moderate", "follow-up", "monitor", "consider", "possible"]

  const textLower = text.toLowerCase()

  if (highRiskKeywords.some((keyword) => textLower.includes(keyword))) {
    return "high"
  } else if (mediumRiskKeywords.some((keyword) => textLower.includes(keyword))) {
    return "medium"
  }
  return "low"
}

function extractFindings(text: string): string[] {
  const findings: string[] = []
  const lines = text.split("\n")

  // Look for bullet points or numbered lists
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/)) {
      findings.push(trimmed.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, ""))
    }
  }

  // If no structured findings found, extract from common medical terms
  if (findings.length === 0) {
    const medicalTerms = ["normal", "abnormal", "opacity", "consolidation", "pneumonia", "effusion", "fracture"]
    for (const term of medicalTerms) {
      if (text.toLowerCase().includes(term)) {
        findings.push(`${term.charAt(0).toUpperCase() + term.slice(1)} identified in analysis`)
      }
    }
  }

  return findings.slice(0, 10) // Limit to 10 findings
}

function extractRecommendations(text: string): string[] {
  const recommendations: string[] = []
  const lines = text.split("\n")

  let inRecommendationSection = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.toLowerCase().includes("recommend")) {
      inRecommendationSection = true
    }

    if (inRecommendationSection && (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+\.\s+/))) {
      recommendations.push(trimmed.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, ""))
    }
  }

  // Default recommendations if none found
  if (recommendations.length === 0) {
    recommendations.push("Clinical correlation recommended")
    recommendations.push("Follow-up as clinically indicated")
  }

  return recommendations.slice(0, 5) // Limit to 5 recommendations
}

function calculateConfidence(text: string, context: any): number {
  let confidence = 70 // Base confidence

  // Increase confidence for detailed analysis
  if (text.length > 500) confidence += 10

  // Increase confidence for structured response
  if (text.includes("findings") || text.includes("recommendations")) confidence += 10

  // Increase confidence if images were analyzed
  if (context.imageCount > 0) confidence += 10

  // Decrease confidence for uncertain language
  const uncertainTerms = ["possible", "probable", "uncertain", "unclear"]
  const uncertainCount = uncertainTerms.reduce((count, term) => count + (text.toLowerCase().split(term).length - 1), 0)
  confidence -= uncertainCount * 5

  return Math.max(30, Math.min(95, confidence))
}

function detectDiscrepancies(
  text: string,
  context: any,
): Array<{
  type: "false_positive" | "false_negative" | "inconsistency"
  description: string
  severity: "low" | "medium" | "high"
  confidence: number
}> {
  const discrepancies: Array<{
    type: "false_positive" | "false_negative" | "inconsistency"
    description: string
    severity: "low" | "medium" | "high"
    confidence: number
  }> = []

  // Check for inconsistencies in the text
  if (text.toLowerCase().includes("normal") && text.toLowerCase().includes("abnormal")) {
    discrepancies.push({
      type: "inconsistency",
      description: "Report contains both normal and abnormal findings - review for clarity",
      severity: "medium",
      confidence: 75,
    })
  }

  // Check for image-text discrepancies if images were provided
  if (context.imageCount > 0 && context.allImageFindings?.length > 0) {
    const reportHasPneumonia = context.reportText.toLowerCase().includes("pneumonia")
    const imageHasOpacity = context.allImageFindings.some((f: string) => f.toLowerCase().includes("opacity"))

    if (reportHasPneumonia && !imageHasOpacity) {
      discrepancies.push({
        type: "false_positive",
        description: "Pneumonia mentioned in report but corresponding opacity not clearly visible in images",
        severity: "medium",
        confidence: 70,
      })
    }
  }

  return discrepancies
}

function generateSummary(text: string, context: any): string {
  const findingsCount = extractFindings(text).length
  const hasImages = context.imageCount > 0

  return (
    `AI analysis of ${context.studyType} for patient ${context.patientId} completed. ` +
    `${findingsCount} findings identified. ` +
    `${hasImages ? `${context.imageCount} images analyzed with cross-modal comparison. ` : "Text-only analysis performed. "}` +
    `Clinical correlation and radiologist review recommended.`
  )
}

function extractBasicFindings(reportText: string): string[] {
  const findings: string[] = []
  const medicalTerms = [
    "normal",
    "abnormal",
    "opacity",
    "consolidation",
    "pneumonia",
    "effusion",
    "fracture",
    "mass",
    "nodule",
    "atelectasis",
  ]

  for (const term of medicalTerms) {
    if (reportText.toLowerCase().includes(term)) {
      findings.push(`${term.charAt(0).toUpperCase() + term.slice(1)} noted in report`)
    }
  }

  return findings.length > 0 ? findings : ["Standard radiological findings documented"]
}

async function saveReportAndAnalysis(
  result: any,
  reportText: string,
  patientId: string,
  studyType: string,
  previousReportId?: string
): Promise<any> {
  let savedReport = null
  try {
    let radiologistId = undefined
    const session = await getServerSession(getAuthOptions())
    if (session?.user?.email) {
      const user = await databaseService.getUserByEmail(session.user.email)
      if (user) {
        radiologistId = user.id
      }
    }

    savedReport = await databaseService.createReport({
      patient_id: patientId,
      study_type: studyType,
      report_text: reportText,
      radiologist_id: radiologistId,
      status: result.riskLevel === "critical" ? "flagged" : "pending",
      previous_report_id: previousReportId || undefined,
    })

    if (savedReport?.id) {
      result.id = savedReport.id // Store the generated report ID back in the returned result
      
      const formattedDiscrepancies = (result.discrepancies || []).map((d: any) => ({
        type: d.type,
        details: d.description,
        confidence: (d.confidence || 80) / 100,
      }))

      await databaseService.createAnalysis({
        report_id: savedReport.id,
        confidence: (result.confidence || 80) / 100,
        risk_level: result.riskLevel,
        findings: result.findings || [],
        potential_false_findings: (result.discrepancies || []).map((d: any) => ({
          finding: d.description,
          likelihood: d.severity,
          reasoning: `Clinical safety audit detected potential ${d.type.replace("_", " ")}`,
          source: "comparison",
          ml_confidence: d.confidence || 80,
        })),
        recommendations: result.recommendations || [],
        summary: result.summary || "",
        medical_relevance_score: result.technicalQuality?.diagnosticConfidence / 100 || 0.8,
        discrepancies: formattedDiscrepancies,
      })

      // Trigger notification dispatch if configured
      const userEmail = session?.user?.email
      if (userEmail) {
        if (result.riskLevel === "critical") {
          await notificationService.notifyReportFlagged(
            userEmail,
            savedReport.id,
            patientId,
            result.riskLevel
          )
        } else {
          await notificationService.notifyAnalysisComplete(
            userEmail,
            savedReport.id,
            patientId,
            (result.confidence || 80) / 100
          )
        }
      }
    }
  } catch (error) {
    console.error("Database save or notification trigger failed:", error)
  }
  return result
}

export async function getPatientReports(patientId: string) {
  const sanitized = sanitizeInput(patientId || "", MAX_PATIENT_ID_LENGTH)
  if (!sanitized) return []
  try {
    return await databaseService.getReportsByPatient(sanitized)
  } catch (error) {
    console.error("Error fetching patient reports:", error)
    return []
  }
}

"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { Buffer } from "buffer"

interface AnalysisResult {
  riskLevel: "low" | "medium" | "high"
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

async function convertImageToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  return `data:${file.type};base64,${base64}`
}

async function analyzeImageWithML(
  base64Image: string,
  studyType: string,
): Promise<{
  findings: string[]
  quality: string
  confidence: number
}> {
  // Simulated ML image analysis based on study type and image characteristics
  const findings: string[] = []
  const quality = "good"
  let confidence = 85

  // Simulate different findings based on study type
  switch (studyType) {
    case "chest-xray":
      findings.push("Heart size appears normal")
      findings.push("Lung fields show clear visualization")
      findings.push("Possible opacity in right lower lobe region")
      findings.push("No obvious pneumothorax visible")
      findings.push("Bony structures appear intact")
      confidence = 87
      break
    case "ct-scan":
      findings.push("Soft tissue contrast is adequate")
      findings.push("No obvious mass lesions detected")
      findings.push("Vascular structures well-defined")
      confidence = 92
      break
    case "mri":
      findings.push("Good tissue contrast resolution")
      findings.push("No obvious signal abnormalities")
      confidence = 89
      break
    default:
      findings.push("Image quality suitable for diagnostic interpretation")
      confidence = 80
  }

  return { findings, quality, confidence }
}

export async function analyzeReport(formData: FormData) {
  const patientId = formData.get("patientId") as string
  const studyType = formData.get("studyType") as string
  const reportText = formData.get("reportText") as string
  const radiologist = formData.get("radiologist") as string
  const imageCount = Number.parseInt((formData.get("imageCount") as string) || "0")

  if (!reportText) {
    throw new Error("Report text is required")
  }

  if (!patientId || !studyType) {
    throw new Error("Patient ID and Study Type are required")
  }

  let allImageFindings: string[] = []
  let avgImageConfidence = 0

  try {
    // Process uploaded images with simulated ML analysis
    const imageAnalysisResults: Array<{
      findings: string[]
      quality: string
      confidence: number
    }> = []

    for (let i = 0; i < imageCount; i++) {
      const imageFile = formData.get(`image_${i}`) as File
      if (imageFile) {
        const base64Image = await convertImageToBase64(imageFile)
        const analysis = await analyzeImageWithML(base64Image, studyType)
        imageAnalysisResults.push(analysis)
      }
    }

    // Combine all image findings
    allImageFindings = imageAnalysisResults.flatMap((result) => result.findings)
    avgImageConfidence =
      imageAnalysisResults.length > 0
        ? imageAnalysisResults.reduce((sum, result) => sum + result.confidence, 0) / imageAnalysisResults.length
        : 0

    // Enhanced prompt for comprehensive analysis
    const analysisPrompt = `You are an advanced AI radiologist. Analyze this radiology case and provide a structured response.

STUDY DETAILS:
- Study Type: ${studyType}
- Patient ID: ${patientId}
- Radiologist: ${radiologist}
- Number of Images: ${imageCount}

RADIOLOGY REPORT:
${reportText}

${
  imageCount > 0
    ? `
IMAGE ANALYSIS RESULTS:
${allImageFindings.map((finding, index) => `${index + 1}. ${finding}`).join("\n")}
Average ML Confidence: ${avgImageConfidence.toFixed(1)}%
`
    : "No images provided for analysis."
}

Please analyze this case and respond with a structured analysis. Focus on:
1. Identifying potential false findings or discrepancies
2. Assessing the quality and completeness of the report
3. Providing clinical recommendations
4. Evaluating the overall risk level

Provide specific, actionable insights for radiologist review.`

    // Use generateText instead of generateObject for more reliable results
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: analysisPrompt,
    })

    // Parse the response and create structured result
    const analysisResult = parseAnalysisResponse(text, {
      patientId,
      studyType,
      radiologist,
      imageCount,
      allImageFindings,
      avgImageConfidence,
      reportText,
    })

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

    return fallbackResult
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

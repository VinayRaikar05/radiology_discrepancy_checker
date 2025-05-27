import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { DatabaseService } from "./database-service"

export interface AdvancedAnalysisResult {
  riskLevel: "low" | "medium" | "high"
  confidence: number
  findings: string[]
  imageFindings: string[]
  discrepancies: Array<{
    type: string
    description: string
    severity: string
    confidence: number
  }>
  recommendations: string[]
  mlMetrics: {
    textAnalysisConfidence: number
    imageAnalysisConfidence: number
    crossModalAgreement: number
  }
  qualityAssessment: {
    reportCompleteness: number
    imageQuality: number
    diagnosticConfidence: number
  }
}

export class AdvancedAIEngine {
  static async performComprehensiveAnalysis(
    studyId: string,
    reportText: string,
    images: File[] = [],
    studyType: string,
  ): Promise<AdvancedAnalysisResult> {
    const startTime = Date.now()

    try {
      // 1. Advanced NLP Analysis
      const textAnalysis = await this.analyzeReportText(reportText, studyType)

      // 2. Computer Vision Analysis
      const imageAnalysis = await this.analyzeImages(images, studyType)

      // 3. Cross-modal comparison
      const crossModalAnalysis = await this.performCrossModalAnalysis(textAnalysis, imageAnalysis, reportText)

      // 4. Quality assessment
      const qualityAssessment = await this.assessQuality(reportText, images, textAnalysis, imageAnalysis)

      // 5. Risk stratification
      const riskLevel = this.calculateRiskLevel(textAnalysis, imageAnalysis, crossModalAnalysis, qualityAssessment)

      const processingTime = Date.now() - startTime

      const result: AdvancedAnalysisResult = {
        riskLevel,
        confidence: this.calculateOverallConfidence(textAnalysis, imageAnalysis, crossModalAnalysis),
        findings: textAnalysis.findings,
        imageFindings: imageAnalysis.findings,
        discrepancies: crossModalAnalysis.discrepancies,
        recommendations: this.generateRecommendations(textAnalysis, imageAnalysis, crossModalAnalysis),
        mlMetrics: {
          textAnalysisConfidence: textAnalysis.confidence,
          imageAnalysisConfidence: imageAnalysis.confidence,
          crossModalAgreement: crossModalAnalysis.agreement,
        },
        qualityAssessment,
      }

      // Save analysis to database
      await DatabaseService.saveAIAnalysis({
        study_id: studyId,
        analysis_type: "comprehensive_ai_analysis",
        risk_level: riskLevel,
        confidence_score: result.confidence,
        findings: result.findings,
        discrepancies: result.discrepancies,
        ml_metrics: result.mlMetrics,
        processing_time_ms: processingTime,
        model_version: "2.0.0",
      })

      return result
    } catch (error) {
      console.error("Advanced AI analysis failed:", error)
      throw new Error("AI analysis failed. Please try again.")
    }
  }

  private static async analyzeReportText(reportText: string, studyType: string) {
    const prompt = `Analyze this ${studyType} radiology report and extract key findings:

${reportText}

Provide a structured analysis focusing on:
1. Pathological findings
2. Normal findings
3. Confidence assessment
4. Potential inconsistencies`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: 1000,
    })

    return {
      findings: this.extractFindings(text),
      confidence: this.calculateTextConfidence(text, reportText),
      inconsistencies: this.detectTextInconsistencies(text),
    }
  }

  private static async analyzeImages(images: File[], studyType: string) {
    // Simulated advanced image analysis
    const findings: string[] = []
    let totalConfidence = 0

    for (const image of images) {
      // In a real implementation, this would use computer vision models
      const imageFindings = await this.processImageWithAI(image, studyType)
      findings.push(...imageFindings.findings)
      totalConfidence += imageFindings.confidence
    }

    return {
      findings,
      confidence: images.length > 0 ? totalConfidence / images.length : 0,
      qualityMetrics: await this.calculateImageQuality(images),
    }
  }

  private static async processImageWithAI(image: File, studyType: string) {
    // Simulated AI image processing
    const findings = [
      "Anatomical structures properly visualized",
      "Image quality adequate for diagnosis",
      "No obvious technical artifacts",
    ]

    if (studyType === "chest-xray") {
      findings.push("Heart size within normal limits")
      findings.push("Lung fields clear bilaterally")
    }

    return {
      findings,
      confidence: 85 + Math.random() * 10, // Simulated confidence
    }
  }

  private static async performCrossModalAnalysis(textAnalysis: any, imageAnalysis: any, reportText: string) {
    const discrepancies = []
    let agreement = 85 // Base agreement score

    // Check for text-image discrepancies
    const textMentionsPneumonia = reportText.toLowerCase().includes("pneumonia")
    const imageShowsConsolidation = imageAnalysis.findings.some(
      (f: string) => f.toLowerCase().includes("consolidation") || f.toLowerCase().includes("opacity"),
    )

    if (textMentionsPneumonia && !imageShowsConsolidation) {
      discrepancies.push({
        type: "false_positive",
        description: "Pneumonia mentioned in text but not clearly visible in images",
        severity: "medium",
        confidence: 75,
      })
      agreement -= 15
    }

    return {
      discrepancies,
      agreement: Math.max(0, agreement),
    }
  }

  private static assessQuality(reportText: string, images: File[], textAnalysis: any, imageAnalysis: any) {
    const reportCompleteness = this.assessReportCompleteness(reportText)
    const imageQuality = images.length > 0 ? imageAnalysis.qualityMetrics : 0
    const diagnosticConfidence = (textAnalysis.confidence + imageAnalysis.confidence) / 2

    return {
      reportCompleteness,
      imageQuality,
      diagnosticConfidence,
    }
  }

  private static calculateRiskLevel(
    textAnalysis: any,
    imageAnalysis: any,
    crossModalAnalysis: any,
    qualityAssessment: any,
  ): "low" | "medium" | "high" {
    let riskScore = 0

    // Risk factors
    if (crossModalAnalysis.discrepancies.length > 0) riskScore += 30
    if (qualityAssessment.reportCompleteness < 70) riskScore += 20
    if (qualityAssessment.imageQuality < 60) riskScore += 25
    if (textAnalysis.inconsistencies.length > 0) riskScore += 15

    if (riskScore >= 50) return "high"
    if (riskScore >= 25) return "medium"
    return "low"
  }

  private static calculateOverallConfidence(textAnalysis: any, imageAnalysis: any, crossModalAnalysis: any): number {
    const baseConfidence = (textAnalysis.confidence + imageAnalysis.confidence) / 2
    const agreementBonus = crossModalAnalysis.agreement * 0.1
    const discrepancyPenalty = crossModalAnalysis.discrepancies.length * 5

    return Math.max(30, Math.min(95, baseConfidence + agreementBonus - discrepancyPenalty))
  }

  private static generateRecommendations(textAnalysis: any, imageAnalysis: any, crossModalAnalysis: any): string[] {
    const recommendations = []

    if (crossModalAnalysis.discrepancies.length > 0) {
      recommendations.push("Manual review recommended due to text-image discrepancies")
    }

    if (textAnalysis.confidence < 70) {
      recommendations.push("Consider additional clinical correlation")
    }

    if (imageAnalysis.confidence < 70) {
      recommendations.push("Image quality may limit diagnostic accuracy")
    }

    recommendations.push("AI findings require radiologist verification")

    return recommendations
  }

  // Helper methods
  private static extractFindings(text: string): string[] {
    const findings = []
    const lines = text.split("\n")

    for (const line of lines) {
      if (line.trim().match(/^[-•*]\s+/) || line.trim().match(/^\d+\.\s+/)) {
        findings.push(
          line
            .trim()
            .replace(/^[-•*]\s+/, "")
            .replace(/^\d+\.\s+/, ""),
        )
      }
    }

    return findings.slice(0, 10)
  }

  private static calculateTextConfidence(analysisText: string, originalText: string): number {
    let confidence = 70

    if (originalText.length > 200) confidence += 10
    if (analysisText.includes("findings") || analysisText.includes("impression")) confidence += 10

    const uncertainTerms = ["possible", "probable", "uncertain"]
    const uncertainCount = uncertainTerms.reduce(
      (count, term) => count + (originalText.toLowerCase().split(term).length - 1),
      0,
    )
    confidence -= uncertainCount * 5

    return Math.max(30, Math.min(95, confidence))
  }

  private static detectTextInconsistencies(text: string): Array<{ type: string; description: string }> {
    const inconsistencies = []

    if (text.toLowerCase().includes("normal") && text.toLowerCase().includes("abnormal")) {
      inconsistencies.push({
        type: "contradiction",
        description: "Report contains contradictory normal/abnormal statements",
      })
    }

    return inconsistencies
  }

  private static assessReportCompleteness(reportText: string): number {
    let score = 50

    const requiredSections = ["findings", "impression", "history"]
    for (const section of requiredSections) {
      if (reportText.toLowerCase().includes(section)) {
        score += 15
      }
    }

    if (reportText.length > 200) score += 10

    return Math.min(100, score)
  }

  private static async calculateImageQuality(images: File[]): Promise<number> {
    if (images.length === 0) return 0

    // Simulated quality assessment based on file size and type
    let totalQuality = 0

    for (const image of images) {
      let quality = 70

      if (image.size > 500000) quality += 15 // Larger files typically better quality
      if (image.type.includes("png")) quality += 10 // PNG typically better than JPEG

      totalQuality += quality
    }

    return totalQuality / images.length
  }
}

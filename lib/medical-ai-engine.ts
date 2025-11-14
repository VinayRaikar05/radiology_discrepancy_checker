import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface AnalysisResult {
  confidence: number
  risk_level: "low" | "medium" | "high" | "critical"
  findings: string[]
  potential_false_findings: any[]
  recommendations: string[]
  summary: string
  medical_relevance_score: number
  discrepancies: any[]
}

export class MedicalAIEngine {
  async validateMedicalContent(text: string): Promise<boolean> {
    // Basic validation for medical content
    const medicalKeywords = [
      "patient",
      "diagnosis",
      "findings",
      "impression",
      "clinical",
      "medical",
      "radiology",
      "x-ray",
      "ct",
      "mri",
      "ultrasound",
      "scan",
      "image",
      "study",
    ]

    const lowerText = text.toLowerCase()
    const hasKeywords = medicalKeywords.some((keyword) => lowerText.includes(keyword))
    const hasMinLength = text.length > 50

    return hasKeywords && hasMinLength
  }

  async analyzeRadiologyReport(reportText: string): Promise<AnalysisResult> {
    try {
      if (!process.env.GROQ_API_KEY) {
        return this.getFallbackAnalysis(reportText)
      }

      const { generateText } = await import("ai")

      const prompt = `
        As a medical AI assistant specializing in radiology, analyze the following radiology report and provide a comprehensive assessment:

        Report: ${reportText}

        Please provide your analysis in the following JSON format:
        {
          "confidence": 0.85,
          "risk_level": "medium",
          "findings": ["list of key findings"],
          "potential_false_findings": [],
          "recommendations": ["list of recommendations"],
          "summary": "brief summary of the analysis",
          "medical_relevance_score": 0.8,
          "discrepancies": []
        }

        Focus on:
        1. Identifying potential false positives or negatives
        2. Assessing the quality and completeness of the report
        3. Providing actionable recommendations
        4. Evaluating medical relevance and accuracy
      `

      const result = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        prompt,
        temperature: 0.3,
      })

      try {
        const analysis = JSON.parse(result.text)
        return {
          confidence: analysis.confidence || 0.75,
          risk_level: analysis.risk_level || "medium",
          findings: analysis.findings || ["Analysis completed"],
          potential_false_findings: analysis.potential_false_findings || [],
          recommendations: analysis.recommendations || ["Continue monitoring"],
          summary: analysis.summary || "AI analysis completed successfully",
          medical_relevance_score: analysis.medical_relevance_score || 0.75,
          discrepancies: analysis.discrepancies || [],
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError)
        return this.getFallbackAnalysis(reportText)
      }
    } catch (error) {
      console.error("AI analysis error:", error)
      return this.getFallbackAnalysis(reportText)
    }
  }

  async generateMedicalSummary(reportText: string): Promise<string> {
    try {
      if (!process.env.GROQ_API_KEY) {
        return "Summary generation requires AI configuration. Please check system settings."
      }

      const { generateText } = await import("ai")

      const result = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        prompt: `Provide a concise medical summary of this radiology report in 2-3 sentences: ${reportText}`,
        temperature: 0.2,
      })

      return result.text
    } catch (error) {
      console.error("Summary generation error:", error)
      return "Unable to generate summary at this time."
    }
  }

  async detectAnomalies(reportText: string): Promise<string[]> {
    try {
      if (!process.env.GROQ_API_KEY) {
        return []
      }

      const { generateText } = await import("ai")

      const result = await generateText({
        model: groq("llama-3.1-70b-versatile"),
        prompt: `Identify any potential anomalies or inconsistencies in this radiology report. Return as a JSON array of strings: ${reportText}`,
        temperature: 0.3,
      })

      try {
        return JSON.parse(result.text)
      } catch {
        return []
      }
    } catch (error) {
      console.error("Anomaly detection error:", error)
      return []
    }
  }

  private getFallbackAnalysis(reportText: string): AnalysisResult {
    // Generate a basic analysis based on text characteristics
    const wordCount = reportText.split(/\s+/).length
    const hasNormalFindings = /normal|unremarkable|no.*abnormal/i.test(reportText)
    const hasAbnormalFindings = /abnormal|lesion|mass|fracture|pneumonia/i.test(reportText)

    let riskLevel: "low" | "medium" | "high" | "critical" = "low"
    let confidence = 0.6

    if (hasAbnormalFindings) {
      riskLevel = "medium"
      confidence = 0.7
    }

    if (wordCount < 50) {
      confidence = 0.5
    }

    return {
      confidence,
      risk_level: riskLevel,
      findings: hasNormalFindings
        ? ["Normal study findings", "No acute abnormalities identified"]
        : ["Findings require clinical correlation", "Further evaluation may be needed"],
      potential_false_findings: [],
      recommendations: [
        "Clinical correlation recommended",
        "Follow standard protocols",
        hasAbnormalFindings ? "Consider follow-up imaging" : "Routine follow-up as clinically indicated",
      ],
      summary: hasNormalFindings
        ? "Normal radiological study with no significant abnormalities detected."
        : "Study completed with findings that may require clinical correlation and follow-up.",
      medical_relevance_score: confidence,
      discrepancies: [],
    }
  }
}

export const medicalAIEngine = new MedicalAIEngine()

// Helper function for backward compatibility
export async function analyzeRadiologyReport(reportText: string, reportId?: string) {
  return await medicalAIEngine.analyzeRadiologyReport(reportText)
}

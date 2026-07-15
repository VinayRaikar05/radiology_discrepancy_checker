import { describe, it, expect } from "vitest"

describe("Medical AI Engine", () => {
  describe("validateMedicalContent", () => {
    it("should accept valid radiology report text", async () => {
      const { MedicalAIEngine } = await import("@/lib/medical-ai-engine")
      const engine = new MedicalAIEngine()

      const validReport =
        "The patient presents with a chest x-ray showing findings consistent with bilateral pneumonia. Clinical correlation is recommended."
      const result = await engine.validateMedicalContent(validReport)

      expect(result).toBe(true)
    })

    it("should reject non-medical text", async () => {
      const { MedicalAIEngine } = await import("@/lib/medical-ai-engine")
      const engine = new MedicalAIEngine()

      const invalidText = "This is a grocery list with apples, bananas, and oranges."
      const result = await engine.validateMedicalContent(invalidText)

      expect(result).toBe(false)
    })

    it("should reject text that is too short", async () => {
      const { MedicalAIEngine } = await import("@/lib/medical-ai-engine")
      const engine = new MedicalAIEngine()

      const shortText = "Patient normal."
      const result = await engine.validateMedicalContent(shortText)

      expect(result).toBe(false)
    })
  })

  describe("getFallbackAnalysis (via analyzeRadiologyReport without GROQ_API_KEY)", () => {
    it("should return a structured analysis result for normal findings", async () => {
      // Ensure GROQ_API_KEY is not set so fallback is used
      const originalKey = process.env.GROQ_API_KEY
      delete process.env.GROQ_API_KEY

      const { MedicalAIEngine } = await import("@/lib/medical-ai-engine")
      const engine = new MedicalAIEngine()

      const report =
        "Chest X-Ray: The heart size is normal. Lungs are clear. No pneumothorax. Bony structures are intact. Impression: Unremarkable chest radiograph."
      const result = await engine.analyzeRadiologyReport(report)

      expect(result).toBeDefined()
      expect(result.risk_level).toBe("low")
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.findings).toBeInstanceOf(Array)
      expect(result.findings.length).toBeGreaterThan(0)
      expect(result.recommendations).toBeInstanceOf(Array)
      expect(result.summary).toBeTruthy()

      // Restore
      if (originalKey) process.env.GROQ_API_KEY = originalKey
    })

    it("should detect abnormal findings and raise risk level", async () => {
      const originalKey = process.env.GROQ_API_KEY
      delete process.env.GROQ_API_KEY

      const { MedicalAIEngine } = await import("@/lib/medical-ai-engine")
      const engine = new MedicalAIEngine()

      const abnormalReport =
        "Chest X-Ray: There is a large mass in the right upper lobe with associated pneumonia and pleural effusion. Fracture of right 5th rib noted."
      const result = await engine.analyzeRadiologyReport(abnormalReport)

      expect(result.risk_level).toBe("medium")
      expect(result.confidence).toBeGreaterThanOrEqual(0.5)

      if (originalKey) process.env.GROQ_API_KEY = originalKey
    })
  })
})

import { describe, it, expect } from "vitest"
import {
  auditLaterality,
  auditGradingSystem,
  auditCriticalFindings,
  applyClinicalSafetyAudits,
} from "@/lib/clinical-audits"

describe("Clinical Safety Audits", () => {
  describe("auditLaterality", () => {
    it("should detect laterality mismatches between findings and impression", () => {
      const conflictingReport = `
        Findings: There is an acute fracture of the left femur midshaft with minor displacement.
        Impression: Acute right femur fracture with displacement.
      `
      const result = auditLaterality(conflictingReport)
      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0].type).toBe("inconsistency")
      expect(result[0].severity).toBe("high")
      expect(result[0].description).toContain("LEFT femur fracture in findings, but RIGHT in impression")
    })

    it("should not trigger on correct laterality matching", () => {
      const correctReport = `
        Findings: There is an acute fracture of the left femur midshaft.
        Impression: Acute left femur fracture.
      `
      const result = auditLaterality(correctReport)
      expect(result.length).toBe(0)
    })

    it("should handle normal anatomical reports describing different sides differently", () => {
      const detailedNormalReport = `
        Findings: The left kidney is normal in size and shape. The right kidney has a small simple cortical cyst.
        Impression: Right renal cortical cyst. No acute abdominal abnormality.
      `
      const result = auditLaterality(detailedNormalReport)
      // Since "left kidney normal" and "right kidney cyst" are not conflicting findings on the same pathology
      expect(result.length).toBe(0)
    })
  })

  describe("auditGradingSystem", () => {
    it("should flag breast studies lacking BI-RADS scoring", () => {
      const studyType = "Mammography"
      const report = "Findings: Normal parenchyma density. No masses or calcifications. Impression: Normal study."
      const result = auditGradingSystem(report, studyType)
      expect(result.length).toBe(1)
      expect(result[0].description).toContain("BI-RADS category score")
    })

    it("should not flag breast studies with correct BI-RADS scoring", () => {
      const studyType = "Mammogram"
      const report = "Findings: Dense breast tissue. Impression: BI-RADS Category 1 - Negative."
      const result = auditGradingSystem(report, studyType)
      expect(result.length).toBe(0)
    })

    it("should flag prostate studies lacking PI-RADS scoring", () => {
      const studyType = "Prostate MRI"
      const report = "Findings: Normal peripheral zone. Impression: Unremarkable study."
      const result = auditGradingSystem(report, studyType)
      expect(result.length).toBe(1)
      expect(result[0].description).toContain("PI-RADS score")
    })

    it("should not flag prostate studies with correct PI-RADS scoring", () => {
      const studyType = "Prostate MRI"
      const report = "Findings: Unremarkable. Impression: PI-RADS 2 (low likelihood of clinically significant cancer)."
      const result = auditGradingSystem(report, studyType)
      expect(result.length).toBe(0)
    })
  })

  describe("auditCriticalFindings", () => {
    it("should identify critical values in text", () => {
      const report = "Findings: There is a large right pneumothorax and collapse of the lung."
      const result = auditCriticalFindings(report, [], [])
      expect(result.isCritical).toBe(true)
      expect(result.findings).toContain("Pneumothorax")
    })

    it("should ignore negated critical terms", () => {
      const report = "Findings: Clear lung fields. No pneumothorax or pleural effusion."
      const result = auditCriticalFindings(report, [], [])
      expect(result.isCritical).toBe(false)
      expect(result.findings.length).toBe(0)
    })

    it("should identify other critical issues like intracranial hemorrhage", () => {
      const report = "Findings: Large acute subdural hematoma along the left cerebral hemisphere."
      const result = auditCriticalFindings(report, [], [])
      expect(result.isCritical).toBe(true)
      expect(result.findings).toContain("Intracranial Hemorrhage")
    })
  })

  describe("applyClinicalSafetyAudits integration", () => {
    it("should elevate risk level and add recommendations for critical findings", () => {
      const report = "Findings: Pulmonary embolism detected in the right lower lobe."
      const baseResult = {
        riskLevel: "medium",
        findings: ["Lung density"],
        imageFindings: [],
        discrepancies: [],
        recommendations: ["Clinical correlation"],
      }

      const result = applyClinicalSafetyAudits(baseResult, report, "CT Angiography Chest")
      expect(result.riskLevel).toBe("critical")
      expect(result.recommendations[0]).toContain("CRITICAL FINDING: Immediate verbal communication")
      expect(result.discrepancies.length).toBeGreaterThan(0)
      expect(result.potentialFalseFindings.length).toBeGreaterThan(0)
    })
  })
})

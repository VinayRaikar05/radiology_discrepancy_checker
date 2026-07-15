/**
 * Clinical Safety Audits Utility Module
 *
 * Contains pure synchronous clinical checks for:
 *   1. Laterality/spatial mismatches (e.g., left vs. right)
 *   2. Standard compliance grading (BI-RADS / PI-RADS check)
 *   3. Critical life-threatening findings scans (pneumothorax, PE, brain bleed, etc.)
 */

export function applyClinicalSafetyAudits(result: any, reportText: string, studyType: string): any {
  // Initialize discrepancies and recommendations arrays if not present
  if (!result.discrepancies) {
    result.discrepancies = []
  }
  if (!result.recommendations) {
    result.recommendations = []
  }

  // 1. Check for laterality conflicts
  const lateralityDiscrepancies = auditLaterality(reportText)
  result.discrepancies.push(...lateralityDiscrepancies)

  // 2. Check for missing/contradictory BI-RADS or PI-RADS
  const gradingDiscrepancies = auditGradingSystem(reportText, studyType)
  result.discrepancies.push(...gradingDiscrepancies)

  // 3. Scan for critical values
  const criticalAudit = auditCriticalFindings(reportText, result.findings || [], result.imageFindings || [])
  if (criticalAudit.isCritical) {
    result.riskLevel = "critical"
    
    // Check if we already have this recommendation
    const hasCallRec = result.recommendations.some((r: string) => r.includes("CRITICAL FINDING") || r.includes("verbal communication"))
    if (!hasCallRec) {
      result.recommendations.unshift("CRITICAL FINDING: Immediate verbal communication with the ordering physician is recommended.")
    }

    result.discrepancies.push({
      type: "inconsistency",
      description: `Critical finding identified (${criticalAudit.findings.join(", ")}). Immediate notification required.`,
      severity: "high",
      confidence: 95
    })
  }

  // Recalculate potentialFalseFindings from discrepancies
  result.potentialFalseFindings = (result.discrepancies || []).map((d: any) => ({
    finding: d.description,
    likelihood: d.severity,
    reasoning: `Clinical safety audit detected potential ${d.type.replace("_", " ")}`,
    source: "comparison" as const,
    mlConfidence: d.confidence,
  }))

  return result
}

export function auditLaterality(reportText: string): Array<{
  type: "false_positive" | "false_negative" | "inconsistency"
  description: string
  severity: "low" | "medium" | "high"
  confidence: number
}> {
  const discrepancies: any[] = []
  
  const textLower = reportText.toLowerCase()
  const impressionIndex = reportText.search(/(impression|conclusion|dx|opinion):/i)
  if (impressionIndex !== -1) {
    const findingsPart = textLower.slice(0, impressionIndex)
    const impressionPart = textLower.slice(impressionIndex)

    const organs = ["femur", "lung", "breast", "kidney", "ovary", "testicle", "arm", "leg", "shoulder", "hip", "humerus", "tibia"]
    const pathologies = ["fracture", "nodule", "mass", "effusion", "consolidation", "lesion", "cyst", "pneumonia"]

    for (const organ of organs) {
      for (const pathology of pathologies) {
        // Look for organ/pathology paired with side in findings
        const findingsHasLeft = new RegExp(`left\\s+(?:[a-z]+\\s+){0,4}${organ}|${organ}\\s+(?:[a-z]+\\s+){0,4}left|left\\s+(?:[a-z]+\\s+){0,4}${pathology}|${pathology}\\s+(?:[a-z]+\\s+){0,4}left`, "i").test(findingsPart)
        const findingsHasRight = new RegExp(`right\\s+(?:[a-z]+\\s+){0,4}${organ}|${organ}\\s+(?:[a-z]+\\s+){0,4}right|${organ}\\s+(?:[a-z]+\\s+){0,4}right|right\\s+(?:[a-z]+\\s+){0,4}${pathology}|${pathology}\\s+(?:[a-z]+\\s+){0,4}right`, "i").test(findingsPart)
        
        const impressionHasLeft = new RegExp(`left\\s+(?:[a-z]+\\s+){0,4}${organ}|${organ}\\s+(?:[a-z]+\\s+){0,4}left|left\\s+(?:[a-z]+\\s+){0,4}${pathology}|${pathology}\\s+(?:[a-z]+\\s+){0,4}left`, "i").test(impressionPart)
        const impressionHasRight = new RegExp(`right\\s+(?:[a-z]+\\s+){0,4}${organ}|${organ}\\s+(?:[a-z]+\\s+){0,4}right|${organ}\\s+(?:[a-z]+\\s+){0,4}right|right\\s+(?:[a-z]+\\s+){0,4}${pathology}|${pathology}\\s+(?:[a-z]+\\s+){0,4}right`, "i").test(impressionPart)

        if ((findingsHasLeft && impressionHasRight) && !findingsHasRight && !impressionHasLeft) {
          discrepancies.push({
            type: "inconsistency",
            description: `Laterality conflict: described as LEFT ${organ} ${pathology} in findings, but RIGHT in impression.`,
            severity: "high",
            confidence: 90,
          })
        } else if ((findingsHasRight && impressionHasLeft) && !findingsHasLeft && !impressionHasRight) {
          discrepancies.push({
            type: "inconsistency",
            description: `Laterality conflict: described as RIGHT ${organ} ${pathology} in findings, but LEFT in impression.`,
            severity: "high",
            confidence: 90,
          })
        }
      }
    }
  }
  return discrepancies
}

export function auditGradingSystem(reportText: string, studyType: string): any[] {
  const discrepancies: any[] = []
  const studyLower = studyType.toLowerCase()
  const textLower = reportText.toLowerCase()

  const isBreastStudy = studyLower.includes("mammogram") || studyLower.includes("mammography") || studyLower.includes("breast")
  if (isBreastStudy) {
    const hasBiRads = /bi-?rads\s*(?:category)?\s*[0-6]/i.test(textLower)
    if (!hasBiRads) {
      discrepancies.push({
        type: "inconsistency",
        description: "Standard compliance issue: Mammography/Breast study report does not contain a BI-RADS category score (e.g., BI-RADS Category 1-6).",
        severity: "medium",
        confidence: 85,
      })
    }
  }

  const isProstateStudy = studyLower.includes("prostate")
  if (isProstateStudy) {
    const hasPiRads = /pi-?rads\s*(?:score|category)?\s*[1-5]/i.test(textLower)
    if (!hasPiRads) {
      discrepancies.push({
        type: "inconsistency",
        description: "Standard compliance issue: Prostate study report does not contain a PI-RADS score (e.g., PI-RADS 1-5).",
        severity: "medium",
        confidence: 85,
      })
    }
  }

  return discrepancies
}

export function auditCriticalFindings(reportText: string, findings: string[], imageFindings: string[]): { isCritical: boolean; findings: string[] } {
  const criticalKeywords = [
    { pattern: /pneumothorax/i, label: "Pneumothorax" },
    { pattern: /pulmonary\s+embol(ism|us)|(?:\bpe\b)/i, label: "Pulmonary Embolism" },
    { pattern: /intracranial\s+hemorrhage|subarachnoid\s+hemorrhage|subdural\s+hematoma|epidural\s+hematoma|brain\s+bleed/i, label: "Intracranial Hemorrhage" },
    { pattern: /aortic\s+dissection|aortic\s+aneurysm/i, label: "Aortic Dissection/Aneurysm" },
    { pattern: /pneumoperitoneum|free\s+air\s+in\s+abdomen/i, label: "Pneumoperitoneum" },
    { pattern: /spinal\s+cord\s+compression/i, label: "Spinal Cord Compression" },
    { pattern: /torsion\b/i, label: "Torsion (Testicular/Ovarian)" }
  ]

  const textLower = reportText.toLowerCase()
  const detected: string[] = []

  for (const item of criticalKeywords) {
    if (item.pattern.test(textLower)) {
      const matchIndex = textLower.search(item.pattern)
      const surroundingText = textLower.slice(Math.max(0, matchIndex - 30), matchIndex)
      
      const isNegated = /\b(?:no|negative\s+for|without|normal|clear\s+of|free\s+of|absence\s+of)\b/i.test(surroundingText)
      if (!isNegated) {
        detected.push(item.label)
      }
    }
  }

  return {
    isCritical: detected.length > 0,
    findings: detected,
  }
}

/**
 * Medical Image Classifier — Hugging Face BiomedCLIP Integration
 *
 * Uses Microsoft's BiomedCLIP model (trained on 15M+ biomedical image-text
 * pairs from PubMed) for zero-shot medical image classification.
 *
 * Architecture:
 *   Image Upload → BiomedCLIP (HF Inference API) → structured findings
 *                                                        ↓
 *   Report Text + Image Findings → Groq LLM → discrepancy analysis
 */

import { InferenceClient } from "@huggingface/inference"

// ──────────────────────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────────────────────
const BIOMEDCLIP_MODEL = "microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224"

// Candidate labels for zero-shot radiology classification
// These cover the most common radiological findings across modalities
const RADIOLOGY_LABELS = [
  // Normal
  "normal study with no abnormalities",
  // Pulmonary
  "pneumonia or lung consolidation",
  "pleural effusion",
  "pneumothorax",
  "pulmonary nodule or mass",
  "atelectasis or lung collapse",
  "pulmonary edema",
  "emphysema or COPD changes",
  // Cardiac
  "cardiomegaly or enlarged heart",
  "pericardial effusion",
  // Musculoskeletal
  "bone fracture",
  "degenerative joint disease or arthritis",
  "spinal disc herniation",
  // Abdominal
  "abdominal mass or lesion",
  "bowel obstruction",
  "appendicitis",
  // Neurological
  "intracranial hemorrhage",
  "brain mass or tumor",
  "cerebral infarct or stroke",
  // Breast
  "suspicious breast mass or lesion",
  "breast calcifications",
  // Other
  "medical device or implant present",
  "post-surgical changes",
]

// Study-type specific labels for more targeted classification
const STUDY_SPECIFIC_LABELS: Record<string, string[]> = {
  "Chest X-Ray": [
    "normal chest radiograph",
    "pneumonia or consolidation",
    "pleural effusion",
    "pneumothorax",
    "cardiomegaly",
    "pulmonary nodule",
    "atelectasis",
    "pulmonary edema",
    "rib fracture",
    "mediastinal widening",
    "hilar lymphadenopathy",
  ],
  "CT Head": [
    "normal brain CT",
    "intracranial hemorrhage",
    "cerebral infarct or stroke",
    "brain mass or tumor",
    "cerebral edema",
    "midline shift",
    "hydrocephalus",
    "skull fracture",
  ],
  "Abdominal CT": [
    "normal abdominal CT",
    "liver mass or lesion",
    "kidney stone or nephrolithiasis",
    "appendicitis",
    "bowel obstruction",
    "abdominal aortic aneurysm",
    "pancreatitis",
    "splenomegaly",
    "free fluid in abdomen",
  ],
  "MRI Brain": [
    "normal brain MRI",
    "brain tumor or mass",
    "multiple sclerosis plaques",
    "cerebral infarct",
    "intracranial hemorrhage",
    "brain atrophy",
    "hydrocephalus",
  ],
  "Spine MRI": [
    "normal spine",
    "disc herniation",
    "spinal stenosis",
    "vertebral compression fracture",
    "spinal cord compression",
    "degenerative disc disease",
    "spondylolisthesis",
  ],
  Mammography: [
    "normal mammogram",
    "suspicious breast mass",
    "breast calcifications",
    "breast cyst",
    "architectural distortion",
    "asymmetric density",
    "skin thickening",
  ],
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export interface MedicalClassificationResult {
  /** Top predicted finding */
  primaryFinding: string
  /** Confidence score for the primary finding (0-1) */
  primaryConfidence: number
  /** All findings above the threshold, sorted by confidence */
  findings: Array<{
    label: string
    confidence: number
  }>
  /** Whether the image appears normal */
  isNormal: boolean
  /** The model used for classification */
  model: string
  /** Processing metadata */
  processingInfo: {
    studyType: string
    labelsUsed: number
    timestamp: string
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Classifier
// ──────────────────────────────────────────────────────────────────────────────
function getHuggingFaceClient(): InferenceClient | null {
  const token = process.env.HUGGINGFACE_API_KEY
  if (!token) {
    console.warn("HUGGINGFACE_API_KEY not set — medical image classification unavailable")
    return null
  }
  return new InferenceClient(token)
}

/**
 * Classify a medical image using BiomedCLIP zero-shot classification.
 *
 * @param imageData - Raw image bytes (Uint8Array or Buffer)
 * @param studyType - The type of radiology study (e.g., "Chest X-Ray", "CT Head")
 * @param confidenceThreshold - Minimum confidence to include a finding (default 0.05)
 */
export async function classifyMedicalImage(
  imageData: Uint8Array | Buffer,
  studyType: string = "",
  confidenceThreshold: number = 0.05,
): Promise<MedicalClassificationResult | null> {
  const client = getHuggingFaceClient()
  if (!client) return null

  try {
    // Choose labels based on study type for more targeted classification
    const labels = STUDY_SPECIFIC_LABELS[studyType] || RADIOLOGY_LABELS

    const result = await client.zeroShotImageClassification({
      model: BIOMEDCLIP_MODEL,
      inputs: {
        image: new Blob([Buffer.from(imageData)]),
      },
      parameters: {
        candidate_labels: labels,
      },
    })

    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn("BiomedCLIP returned empty results")
      return null
    }

    // Sort by confidence (descending)
    const sorted = result
      .map((r: any) => ({
        label: r.label,
        confidence: r.score,
      }))
      .sort((a: any, b: any) => b.confidence - a.confidence)

    // Filter by threshold
    const significantFindings = sorted.filter(
      (f: any) => f.confidence >= confidenceThreshold,
    )

    const primaryFinding = sorted[0]
    const isNormal = primaryFinding.label.toLowerCase().includes("normal")

    return {
      primaryFinding: primaryFinding.label,
      primaryConfidence: primaryFinding.confidence,
      findings: significantFindings,
      isNormal,
      model: BIOMEDCLIP_MODEL,
      processingInfo: {
        studyType: studyType || "unknown",
        labelsUsed: labels.length,
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("BiomedCLIP classification failed:", error)
    return null
  }
}

/**
 * Classify multiple images and aggregate findings.
 */
export async function classifyMultipleImages(
  images: Array<Uint8Array | Buffer>,
  studyType: string = "",
): Promise<{
  aggregatedFindings: Array<{ label: string; avgConfidence: number; imageCount: number }>
  perImageResults: Array<MedicalClassificationResult | null>
  summary: string
}> {
  const results = await Promise.all(
    images.map((img) => classifyMedicalImage(img, studyType)),
  )

  // Aggregate findings across all images
  const findingMap = new Map<string, { totalConfidence: number; count: number }>()

  for (const result of results) {
    if (!result) continue
    for (const finding of result.findings) {
      const existing = findingMap.get(finding.label) || { totalConfidence: 0, count: 0 }
      existing.totalConfidence += finding.confidence
      existing.count += 1
      findingMap.set(finding.label, existing)
    }
  }

  const aggregatedFindings = Array.from(findingMap.entries())
    .map(([label, data]) => ({
      label,
      avgConfidence: data.totalConfidence / data.count,
      imageCount: data.count,
    }))
    .sort((a, b) => b.avgConfidence - a.avgConfidence)

  const validResults = results.filter(Boolean) as MedicalClassificationResult[]
  const topFindings = aggregatedFindings.slice(0, 5).map((f) => f.label)
  const hasAbnormalities = aggregatedFindings.some(
    (f) => !f.label.toLowerCase().includes("normal") && f.avgConfidence > 0.15,
  )

  const summary = hasAbnormalities
    ? `BiomedCLIP analysis of ${validResults.length} image(s) detected potential findings: ${topFindings.join("; ")}. Clinical correlation recommended.`
    : `BiomedCLIP analysis of ${validResults.length} image(s) shows findings within normal limits.`

  return {
    aggregatedFindings,
    perImageResults: results,
    summary,
  }
}

/**
 * Format BiomedCLIP results into a structured string for LLM consumption.
 */
export function formatFindingsForLLM(
  aggregatedFindings: Array<{ label: string; avgConfidence: number; imageCount: number }>,
): string {
  if (aggregatedFindings.length === 0) {
    return "No findings detected by the medical image classifier."
  }

  const lines = aggregatedFindings
    .filter((f) => f.avgConfidence >= 0.05)
    .map(
      (f) =>
        `- ${f.label}: ${(f.avgConfidence * 100).toFixed(1)}% confidence (detected in ${f.imageCount} image${f.imageCount > 1 ? "s" : ""})`,
    )

  return [
    "=== BiomedCLIP Medical Image Classification Results ===",
    ...lines,
    "======================================================",
  ].join("\n")
}

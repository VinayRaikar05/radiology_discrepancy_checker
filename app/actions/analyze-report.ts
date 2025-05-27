export async function analyzeReport(formData: FormData) {
  const patientId = formData.get("patientId") as string
  const studyType = formData.get("studyType") as string
  const reportText = formData.get("reportText") as string
  const radiologist = formData.get("radiologist") as string
  const imageCount = Number.parseInt((formData.get("imageCount") as string) || "0")

  // Validate required fields
  if (!reportText) {
    throw new Error("Report text is required")
  }

  if (!patientId || !studyType) {
    throw new Error("Patient ID and Study Type are required")
  }

  // Validate image sizes
  let totalSize = 0
  for (let i = 0; i < imageCount; i++) {
    const imageFile = formData.get(`image_${i}`) as File
    if (imageFile) {
      totalSize += imageFile.size

      // Individual file size check (5MB limit)
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error(`Image ${i + 1} is too large. Maximum size is 5MB per image.`)
      }
    }
  }

  // Total payload size check (8MB limit for all images combined)
  if (totalSize > 8 * 1024 * 1024) {
    throw new Error("Total image size exceeds 8MB limit. Please reduce image sizes or upload fewer images.")
  }

  // Rest of the function continues as before...
}

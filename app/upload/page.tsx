"use client"

import type React from "react"

import { useState } from "react"
import { ImageIcon, Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UploadPage() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    for (const file of imageFiles) {
      // Check file size (limit to 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        setError(`Image "${file.name}" is too large. Please use images under 5MB.`)
        continue
      }

      // Compress image before adding
      const compressedFile = await compressImage(file)
      setSelectedImages((prev) => [...prev, compressedFile])

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(compressedFile)
    }
  }

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1024px on longest side)
        const maxSize = 1024
        let { width, height } = img

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          "image/jpeg",
          0.8, // 80% quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Upload Medical Data</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="images">Medical Images (Optional)</Label>
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
            <Brain className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-blue-800 font-medium">AI-Powered Image Analysis</p>
              <p className="text-xs text-blue-600">
                Upload medical images for machine learning analysis and comparison with report text
              </p>
              <p className="text-xs text-gray-500">
                Supports JPEG, PNG • Max 5MB per image • Auto-compressed to optimize processing
              </p>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => document.getElementById("images")?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Choose Medical Images
              </Button>
            </div>
          </div>
        </div>

        <div>
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img src={preview || "/placeholder.svg"} alt={`Preview ${index}`} className="rounded-lg" />
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 focus:outline-none"
                    onClick={() => {
                      setSelectedImages((prev) => prev.filter((_, i) => i !== index))
                      setImagePreviews((prev) => prev.filter((_, i) => i !== index))
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

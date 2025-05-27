"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Loader2,
  ImageIcon,
  X,
  AlertCircle,
  Brain,
  Eye,
  Zap,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import { analyzeReport } from "../actions/analyze-report"

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    patientId: "",
    studyType: "",
    reportText: "",
    radiologist: "",
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))

    setSelectedImages((prev) => [...prev, ...imageFiles])

    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      if (!formData.patientId || !formData.studyType || !formData.reportText) {
        throw new Error("Please fill in all required fields")
      }

      const submitFormData = new FormData()
      submitFormData.append("patientId", formData.patientId)
      submitFormData.append("studyType", formData.studyType)
      submitFormData.append("reportText", formData.reportText)
      submitFormData.append("radiologist", formData.radiologist)

      selectedImages.forEach((image, index) => {
        submitFormData.append(`image_${index}`, image)
      })
      submitFormData.append("imageCount", selectedImages.length.toString())

      const result = await analyzeReport(submitFormData)
      setAnalysisResult(result)
    } catch (error) {
      console.error("Analysis failed:", error)
      setError(error instanceof Error ? error.message : "Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI-Powered Radiology Analysis</h1>
                <p className="text-sm text-gray-600">Deep Learning • Computer Vision • Natural Language Processing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Report & Medical Images
              </CardTitle>
              <CardDescription>
                Advanced AI analysis using machine learning models for medical image and text analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient ID *</Label>
                  <Input
                    id="patientId"
                    value={formData.patientId}
                    onChange={(e) => handleInputChange("patientId", e.target.value)}
                    placeholder="Enter patient ID"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studyType">Study Type *</Label>
                  <Select value={formData.studyType} onValueChange={(value) => handleInputChange("studyType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select study type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest-xray">Chest X-Ray</SelectItem>
                      <SelectItem value="ct-scan">CT Scan</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ultrasound">Ultrasound</SelectItem>
                      <SelectItem value="mammography">Mammography</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportText">Radiology Report Text *</Label>
                  <Textarea
                    id="reportText"
                    value={formData.reportText}
                    onChange={(e) => handleInputChange("reportText", e.target.value)}
                    placeholder="Paste the complete radiology report here..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radiologist">Radiologist</Label>
                  <Input
                    id="radiologist"
                    value={formData.radiologist}
                    onChange={(e) => handleInputChange("radiologist", e.target.value)}
                    placeholder="Radiologist name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Medical Images (Optional)</Label>
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                    <Brain className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm text-blue-800 font-medium">AI-Powered Image Analysis</p>
                      <p className="text-xs text-blue-600">
                        Upload medical images for machine learning analysis and comparison with report text
                      </p>
                      <p className="text-xs text-gray-500">Supports JPEG, PNG • Max 10MB per image</p>
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

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Images ({imagePreviews.length})</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Medical image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-blue-200"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Badge className="absolute bottom-2 left-2 bg-blue-600">
                            <Eye className="mr-1 h-3 w-3" />
                            AI Ready
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI Analysis in Progress...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Enhanced Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Machine Learning Analysis Results
              </CardTitle>
              <CardDescription>AI-powered analysis of medical images and radiology reports</CardDescription>
            </CardHeader>
            <CardContent>
              {!analysisResult && !isAnalyzing && !error && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Upload report and images for AI analysis</p>
                  <p className="text-sm text-gray-400">
                    Machine learning models will analyze medical images and compare with report text
                  </p>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="relative">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-pulse" />
                    <Zap className="h-6 w-6 absolute top-0 right-1/2 transform translate-x-1/2 text-yellow-500 animate-bounce" />
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">AI Neural Networks Processing...</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Computer vision analyzing medical images
                    </div>
                    <div className="flex items-center justify-center">
                      <FileText className="h-4 w-4 mr-2" />
                      NLP processing radiology report
                    </div>
                    <div className="flex items-center justify-center">
                      <Brain className="h-4 w-4 mr-2" />
                      Cross-modal comparison in progress
                    </div>
                  </div>
                </div>
              )}

              {analysisResult && (
                <div className="space-y-6">
                  {/* Analysis Type and Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {analysisResult.analysisType === "multimodal_deep_learning" ? (
                            <>
                              <Brain className="mr-1 h-3 w-3" />
                              Multimodal ML
                            </>
                          ) : (
                            <>
                              <FileText className="mr-1 h-3 w-3" />
                              NLP Analysis
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="text-sm text-blue-600">Analysis Type</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-700">
                        {analysisResult.mlMetrics?.crossModalAgreement || analysisResult.confidence}%
                      </div>
                      <div className="text-sm text-green-600">ML Confidence</div>
                    </div>
                  </div>

                  {/* Overall Assessment */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      AI Assessment
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        className={
                          analysisResult.riskLevel === "low"
                            ? "bg-green-100 text-green-800"
                            : analysisResult.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {analysisResult.riskLevel.toUpperCase()} RISK
                      </Badge>
                    </div>
                    {analysisResult.technicalQuality && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-600 mb-1">Diagnostic Confidence</div>
                        <Progress value={analysisResult.technicalQuality.diagnosticConfidence} className="h-2" />
                        <div className="text-xs text-gray-500 mt-1">
                          {analysisResult.technicalQuality.diagnosticConfidence}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ML Metrics */}
                  {analysisResult.mlMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.mlMetrics.imageAnalysisConfidence > 0 && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Eye className="h-4 w-4 mr-2 text-purple-600" />
                            <span className="text-sm font-medium">Image Analysis</span>
                          </div>
                          <div className="text-lg font-bold text-purple-700">
                            {analysisResult.mlMetrics.imageAnalysisConfidence.toFixed(1)}%
                          </div>
                        </div>
                      )}
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center mb-1">
                          <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                          <span className="text-sm font-medium">Text Analysis</span>
                        </div>
                        <div className="text-lg font-bold text-indigo-700">
                          {analysisResult.mlMetrics.textAnalysisConfidence}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Discrepancies */}
                  {analysisResult.discrepancies && analysisResult.discrepancies.length > 0 && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <h3 className="font-semibold mb-2 text-red-800 flex items-center">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        AI-Detected Discrepancies ({analysisResult.discrepancies.length})
                      </h3>
                      <div className="space-y-3">
                        {analysisResult.discrepancies.map((discrepancy: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                variant={discrepancy.type === "false_positive" ? "destructive" : "default"}
                                className="text-xs"
                              >
                                {discrepancy.type.replace("_", " ").toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-600">ML Confidence: {discrepancy.confidence}%</span>
                            </div>
                            <p className="text-sm font-medium">{discrepancy.description}</p>
                            <p className="text-xs text-gray-600 mt-1">Severity: {discrepancy.severity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cross-Modal Analysis */}
                  {analysisResult.imageTextComparison && (
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h3 className="font-semibold mb-2 text-blue-800 flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Cross-Modal Analysis
                      </h3>
                      <p className="text-sm text-blue-700">{analysisResult.imageTextComparison}</p>
                    </div>
                  )}

                  {/* Report Findings */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Report Findings
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.findings?.map((finding: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-sm">{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Image Findings */}
                  {analysisResult.imageFindings && analysisResult.imageFindings.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        AI Image Analysis ({analysisResult.imageFindings.length} findings)
                      </h3>
                      <ul className="space-y-2">
                        {analysisResult.imageFindings.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <ImageIcon className="w-4 h-4 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                            <span className="text-sm">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Brain className="mr-2 h-4 w-4" />
                      AI Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations?.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

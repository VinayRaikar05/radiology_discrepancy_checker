"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, FileText, User } from "lucide-react"

const mockReports = [
  {
    id: "RPT-001",
    patientId: "PAT-12345",
    studyType: "Chest X-Ray",
    radiologist: "Dr. Smith",
    timestamp: "2024-01-15T10:30:00Z",
    riskLevel: "high",
    confidence: 85,
    status: "pending",
    findings: [
      "Possible pneumonia in right lower lobe",
      "Cardiac silhouette appears enlarged",
      "No obvious fractures detected",
    ],
    potentialFalseFindings: [
      {
        finding: "Possible pneumonia in right lower lobe",
        likelihood: "Medium",
        reasoning: "Pattern could be consistent with atelectasis rather than pneumonia",
      },
    ],
  },
  {
    id: "RPT-002",
    patientId: "PAT-67890",
    studyType: "CT Scan",
    radiologist: "Dr. Johnson",
    timestamp: "2024-01-15T14:20:00Z",
    riskLevel: "medium",
    confidence: 92,
    status: "reviewed",
    findings: ["Small nodule in left lung", "No evidence of metastases", "Normal liver appearance"],
    potentialFalseFindings: [
      {
        finding: "Small nodule in left lung",
        likelihood: "Low",
        reasoning: "Size and characteristics suggest benign nature, but follow-up recommended",
      },
    ],
  },
]

export default function ReviewPage() {
  const [selectedReport, setSelectedReport] = useState(mockReports[0])
  const [filter, setFilter] = useState("all")

  const filteredReports = mockReports.filter((report) => {
    if (filter === "all") return true
    if (filter === "pending") return report.status === "pending"
    if (filter === "reviewed") return report.status === "reviewed"
    if (filter === "high-risk") return report.riskLevel === "high"
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Review Flagged Reports</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Reports Requiring Review</CardTitle>
                <CardDescription>Reports flagged for potential false findings</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={filter} onValueChange={setFilter} className="mb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport.id === report.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{report.id}</span>
                        <Badge
                          variant={
                            report.riskLevel === "high"
                              ? "destructive"
                              : report.riskLevel === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {report.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{report.studyType}</p>
                      <p className="text-xs text-gray-500">{report.patientId}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Confidence: {report.confidence}%</span>
                        {report.status === "pending" ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {selectedReport.id}
                    </CardTitle>
                    <CardDescription>
                      {selectedReport.studyType} • {selectedReport.patientId}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      selectedReport.riskLevel === "high"
                        ? "destructive"
                        : selectedReport.riskLevel === "medium"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {selectedReport.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="analysis" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="findings">Findings</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="analysis" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <User className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-sm font-medium">Radiologist</span>
                        </div>
                        <p className="text-sm">{selectedReport.radiologist}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="text-sm font-medium">Confidence</span>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${selectedReport.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{selectedReport.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Potential False Findings</h3>
                      <div className="space-y-3">
                        {selectedReport.potentialFalseFindings.map((item, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{item.finding}</span>
                              <Badge variant="outline">{item.likelihood} Likelihood</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="findings" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Report Findings</h3>
                      <ul className="space-y-2">
                        {selectedReport.findings.map((finding, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-sm">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    <div className="flex space-x-4">
                      <Button className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Report
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Request Revision
                      </Button>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Review Notes</h4>
                      <textarea
                        className="w-full p-2 border border-yellow-300 rounded text-sm"
                        placeholder="Add your review notes here..."
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

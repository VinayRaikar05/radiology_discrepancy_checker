"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, Clock, FileText, User, RefreshCw, AlertCircle, Loader2 } from "lucide-react"
import {
  fetchReportsForReview,
  submitReviewAction,
  fetchReportComments,
} from "../actions/review-actions"

export default function ReviewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const loadReports = async (selectFirst = true) => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await fetchReportsForReview()
      setReports(data || [])
      if (data && data.length > 0 && selectFirst) {
        setSelectedReport(data[0])
      } else if (!data || data.length === 0) {
        setSelectedReport(null)
      }
    } catch (err) {
      console.error("Failed to load reports:", err)
      setMessage({ type: "error", text: "Failed to load review queue" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadReports()
    }
  }, [status])

  useEffect(() => {
    const loadComments = async () => {
      if (selectedReport?.id) {
        try {
          const list = await fetchReportComments(selectedReport.id)
          setComments(list || [])
        } catch (err) {
          console.error("Failed to load comments:", err)
        }
      } else {
        setComments([])
      }
    }
    loadComments()
    setNotes("")
    setMessage(null)
  }, [selectedReport])

  const handleAction = async (actionType: "approve" | "revise") => {
    if (!selectedReport) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await submitReviewAction(selectedReport.id, actionType, notes)
      if (res.success) {
        setMessage({
          type: "success",
          text: `Report successfully marked as ${actionType === "approve" ? "Approved" : "Revision Requested"}.`,
        })
        // Reload reports but keep current one selected to show updated status
        const data = await fetchReportsForReview()
        setReports(data || [])
        const updated = data.find((r) => r.id === selectedReport.id)
        if (updated) {
          setSelectedReport(updated)
        } else {
          setSelectedReport(data[0] || null)
        }
      } else {
        setMessage({ type: "error", text: res.error || "Action failed" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Submission error occurred" })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true
    if (filter === "pending") return report.status === "pending"
    if (filter === "flagged") return report.status === "flagged"
    return true
  })

  // Format the visual findings for rendering
  const getDiscrepancies = (report: any) => {
    const analysis = report.analysis_results?.[0]
    return analysis?.potential_false_findings || []
  }

  const getFindings = (report: any) => {
    const analysis = report.analysis_results?.[0]
    return analysis?.findings || []
  }

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mr-2" />
        <span>Loading review queue...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Review Queue</h1>
                  <p className="text-sm text-gray-500">Approve radiology scans or request revisions for discrepant findings</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => loadReports(false)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
                <CardTitle>Flagged & Pending Reports</CardTitle>
                <CardDescription>Select a study to audit discrepancies</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={filter} onValueChange={setFilter} className="mb-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="flagged">Flagged</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No reports in this queue.
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedReport?.id === report.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-xs text-muted-foreground">ID: {report.patient_id}</span>
                          <Badge
                            variant={
                              report.status === "flagged"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {report.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">{report.study_type}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            Uploaded: {new Date(report.created_at).toLocaleDateString()}
                          </span>
                          {report.status === "flagged" ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Patient ID: {selectedReport.patient_id}
                      </CardTitle>
                      <CardDescription>
                        {selectedReport.study_type} • Uploaded on {new Date(selectedReport.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        selectedReport.analysis_results?.[0]?.risk_level === "critical"
                          ? "destructive"
                          : selectedReport.analysis_results?.[0]?.risk_level === "high"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {selectedReport.analysis_results?.[0]?.risk_level?.toUpperCase() || "UNKNOWN"} RISK
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {message && (
                    <div className={`p-4 mb-4 rounded text-sm flex items-start ${
                      message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                      <span>{message.text}</span>
                    </div>
                  )}

                  <Tabs defaultValue="report" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="report">Report Text</TabsTrigger>
                      <TabsTrigger value="analysis">AI Discrepancies</TabsTrigger>
                      <TabsTrigger value="comments">Review Comments</TabsTrigger>
                      <TabsTrigger value="actions">Decision Actions</TabsTrigger>
                    </TabsList>

                    {/* Report Text Tab */}
                    <TabsContent value="report" className="space-y-4 pt-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm font-mono text-gray-700 leading-relaxed max-h-[400px] overflow-y-auto">
                        {selectedReport.report_text}
                      </div>
                    </TabsContent>

                    {/* AI Discrepancies Tab */}
                    <TabsContent value="analysis" className="space-y-6 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <span className="text-xs font-semibold text-muted-foreground block mb-1">Radiologist</span>
                          <p className="text-sm font-medium">{selectedReport.radiologist_id ? "Linked System ID" : "Dr. Guest Radiologist"}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <span className="text-xs font-semibold text-muted-foreground block mb-1">AI Diagnostic Confidence</span>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${(selectedReport.analysis_results?.[0]?.confidence || 0.8) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {((selectedReport.analysis_results?.[0]?.confidence || 0.8) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Potential False Findings */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-3">Flagged AI Discrepancies</h3>
                        {getDiscrepancies(selectedReport).length === 0 ? (
                          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            No clinical discrepancies or safety triggers found. This report is clean.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {getDiscrepancies(selectedReport).map((item: any, index: number) => (
                              <div key={index} className="p-4 border border-red-200 bg-red-50/10 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-sm text-red-900">{item.finding}</span>
                                  <Badge variant="destructive">{item.likelihood?.toUpperCase() || "MEDIUM"}</Badge>
                                </div>
                                <p className="text-xs text-gray-600 block mb-1"><strong>Reasoning:</strong> {item.reasoning}</p>
                                <span className="text-[10px] text-muted-foreground block">Verification Confidence: {((item.ml_confidence || 80)).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* General Findings */}
                      <div>
                        <h3 className="text-sm font-bold text-gray-800 mb-2">Extracted Report Findings</h3>
                        <div className="flex flex-wrap gap-2">
                          {getFindings(selectedReport).map((finding: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-white">
                              {finding}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Comments Tab */}
                    <TabsContent value="comments" className="space-y-4 pt-4">
                      <h3 className="text-sm font-bold text-gray-800">Historical Peer Review Comments</h3>
                      {comments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                          No audit reviews or comments recorded for this study.
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {comments.map((comment) => (
                            <div key={comment.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-sm">{comment.users?.full_name || "Unknown Reviewer"}</span>
                                <Badge variant="outline" className="text-[10px]">{comment.users?.role}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">{comment.comment_text}</p>
                              <span className="text-[10px] text-muted-foreground block mt-2">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Actions Tab */}
                    <TabsContent value="actions" className="space-y-4 pt-4">
                      <div className="flex space-x-4">
                        <Button
                          className="flex-1"
                          onClick={() => handleAction("approve")}
                          disabled={submitting}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {submitting ? "Submitting..." : "Approve Report"}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleAction("revise")}
                          disabled={submitting}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          {submitting ? "Submitting..." : "Request Revision"}
                        </Button>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="notes">Clinical Review Notes</Label>
                        <Textarea
                          id="notes"
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="Provide detailed diagnostic justifications or notes for revisions..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          disabled={submitting}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                <FileText className="h-16 w-16 mb-4 text-gray-300" />
                <h3 className="font-semibold text-lg text-gray-700">No report selected</h3>
                <p className="text-sm">Select a pending or flagged study from the queue to start peer auditing</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

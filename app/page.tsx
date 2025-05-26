import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">RadiologyAI</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/upload" className="text-gray-500 hover:text-gray-700">
                Upload Reports
              </Link>
              <Link href="/analytics" className="text-gray-500 hover:text-gray-700">
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Radiology Report Analysis</h2>
          <p className="text-gray-600">AI-powered detection of potential false findings in radiology reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Requiring review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">AI detection accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156h</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload New Report
              </CardTitle>
              <CardDescription>Upload radiology reports for AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload">
                <Button className="w-full">Upload Report</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Review Flagged Reports
              </CardTitle>
              <CardDescription>Review reports with potential false findings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/review">
                <Button variant="outline" className="w-full">
                  Review Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Analysis</CardTitle>
            <CardDescription>Latest radiology reports processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "RPT-001", patient: "Patient A", type: "Chest X-Ray", status: "Clear", time: "2 hours ago" },
                { id: "RPT-002", patient: "Patient B", type: "CT Scan", status: "Flagged", time: "4 hours ago" },
                { id: "RPT-003", patient: "Patient C", type: "MRI", status: "Clear", time: "6 hours ago" },
                {
                  id: "RPT-004",
                  patient: "Patient D",
                  type: "Ultrasound",
                  status: "Under Review",
                  time: "8 hours ago",
                },
              ].map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{report.id}</p>
                      <p className="text-sm text-gray-500">
                        {report.patient} • {report.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === "Clear"
                          ? "bg-green-100 text-green-800"
                          : report.status === "Flagged"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-sm text-gray-500">{report.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

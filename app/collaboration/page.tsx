"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Users, MessageCircle, Eye, Share2, Video, Mic, MicOff, VideoOff } from "lucide-react"
import { DatabaseService } from "@/lib/database-service"

interface CollaborationSession {
  id: string
  study_id: string
  initiator_id: string
  participants: string[]
  status: string
  created_at: string
  studies?: any
  annotations?: any[]
  comments?: any[]
}

export default function CollaborationPage() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollaborationSessions()
  }, [])

  const loadCollaborationSessions = async () => {
    try {
      // In a real app, get current user ID from auth
      const userId = "current-user-id"
      const data = await DatabaseService.getActiveCollaborations(userId)
      setSessions(data || [])
    } catch (error) {
      console.error("Failed to load collaboration sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const startNewSession = async (studyId: string) => {
    try {
      const sessionData = {
        study_id: studyId,
        initiator_id: "current-user-id",
        participants: [],
        status: "active",
      }

      const newSession = await DatabaseService.createCollaborationSession(sessionData)
      setSessions([newSession, ...sessions])
      setSelectedSession(newSession)
    } catch (error) {
      console.error("Failed to start collaboration session:", error)
    }
  }

  const addComment = async () => {
    if (!newComment.trim() || !selectedSession) return

    try {
      // In a real implementation, this would save to the database
      console.log("Adding comment:", newComment)
      setNewComment("")
    } catch (error) {
      console.error("Failed to add comment:", error)
    }
  }

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled)
    // In a real implementation, this would control WebRTC video stream
  }

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled)
    // In a real implementation, this would control WebRTC audio stream
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Real-time Collaboration</h1>
            </div>
            <Button onClick={() => startNewSession("sample-study-id")}>
              <Share2 className="mr-2 h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Session List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Ongoing collaboration sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active sessions</p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSession?.id === session.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Session {session.id.slice(0, 8)}</span>
                          <Badge variant="outline">{session.participants.length + 1} participants</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Study: {session.study_id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500">
                          Started: {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Collaboration Area */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="space-y-6">
                {/* Video Conference Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Video Conference</span>
                      <div className="flex space-x-2">
                        <Button variant={isVideoEnabled ? "default" : "outline"} size="sm" onClick={toggleVideo}>
                          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                        </Button>
                        <Button variant={isAudioEnabled ? "default" : "outline"} size="sm" onClick={toggleAudio}>
                          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
                      <p className="text-white">Video conference area</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Image Viewer with Annotations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Medical Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative">
                      <p className="text-gray-500">Medical image viewer with annotation tools</p>
                      {/* Annotation tools would be here */}
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <Button size="sm" variant="outline">
                          Arrow
                        </Button>
                        <Button size="sm" variant="outline">
                          Circle
                        </Button>
                        <Button size="sm" variant="outline">
                          Text
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Chat/Comments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Discussion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Comments list */}
                      <div className="h-48 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">Dr. Smith</span>
                              <span className="text-xs text-gray-500">2 min ago</span>
                            </div>
                            <p className="text-sm">I notice some opacity in the right lower lobe. What do you think?</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">Dr. Johnson</span>
                              <span className="text-xs text-gray-500">1 min ago</span>
                            </div>
                            <p className="text-sm">
                              I agree. The pattern is consistent with pneumonia. Let me add an annotation.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* New comment input */}
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                          rows={2}
                        />
                        <Button onClick={addComment} disabled={!newComment.trim()}>
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Selected</h3>
                  <p className="text-gray-500">Select a collaboration session or start a new one</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

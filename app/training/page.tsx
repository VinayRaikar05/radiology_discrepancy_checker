"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Play, CheckCircle, Clock, Award, TrendingUp } from "lucide-react"

interface TrainingModule {
  id: string
  title: string
  description: string
  difficulty_level: string
  estimated_duration_minutes: number
  tags: string[]
  progress?: number
  completed?: boolean
}

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [userProgress, setUserProgress] = useState<any>({})

  useEffect(() => {
    loadTrainingModules()
    loadUserProgress()
  }, [])

  const loadTrainingModules = () => {
    // Simulated training modules
    const sampleModules: TrainingModule[] = [
      {
        id: "1",
        title: "Chest X-Ray Interpretation Fundamentals",
        description: "Learn the basics of chest X-ray interpretation including normal anatomy and common pathologies.",
        difficulty_level: "beginner",
        estimated_duration_minutes: 45,
        tags: ["chest", "x-ray", "fundamentals"],
        progress: 75,
        completed: false,
      },
      {
        id: "2",
        title: "Advanced CT Scan Analysis",
        description: "Deep dive into CT scan interpretation with focus on complex cases and differential diagnosis.",
        difficulty_level: "advanced",
        estimated_duration_minutes: 90,
        tags: ["ct", "advanced", "diagnosis"],
        progress: 100,
        completed: true,
      },
      {
        id: "3",
        title: "AI-Assisted Radiology: Best Practices",
        description: "Learn how to effectively integrate AI tools into your radiology workflow.",
        difficulty_level: "intermediate",
        estimated_duration_minutes: 60,
        tags: ["ai", "workflow", "best-practices"],
        progress: 0,
        completed: false,
      },
      {
        id: "4",
        title: "Pediatric Imaging Considerations",
        description: "Special considerations and techniques for pediatric radiology imaging.",
        difficulty_level: "intermediate",
        estimated_duration_minutes: 75,
        tags: ["pediatric", "special-populations"],
        progress: 30,
        completed: false,
      },
    ]
    setModules(sampleModules)
  }

  const loadUserProgress = () => {
    // Simulated user progress data
    setUserProgress({
      totalModules: 4,
      completedModules: 1,
      totalHours: 12.5,
      averageScore: 87,
    })
  }

  const startModule = (module: TrainingModule) => {
    setSelectedModule(module)
    // In a real implementation, this would navigate to the module content
    console.log("Starting module:", module.title)
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Training & Education</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress.totalModules}</div>
              <p className="text-xs text-muted-foreground">Available for training</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress.completedModules}</div>
              <p className="text-xs text-muted-foreground">Modules finished</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress.totalHours}h</div>
              <p className="text-xs text-muted-foreground">Total learning time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProgress.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Training Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Available Training Modules</CardTitle>
            <CardDescription>Enhance your radiology skills with our comprehensive training program</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription className="mt-2">{module.description}</CardDescription>
                      </div>
                      {module.completed && <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 ml-2" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Module metadata */}
                      <div className="flex items-center justify-between text-sm">
                        <Badge className={getDifficultyColor(module.difficulty_level)}>{module.difficulty_level}</Badge>
                        <span className="text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {module.estimated_duration_minutes} min
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {module.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Progress */}
                      {module.progress !== undefined && module.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2" />
                        </div>
                      )}

                      {/* Action button */}
                      <Button
                        onClick={() => startModule(module)}
                        className="w-full"
                        variant={module.completed ? "outline" : "default"}
                      >
                        {module.completed ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review Module
                          </>
                        ) : module.progress && module.progress > 0 ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Continue Learning
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Module
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Path Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommended Learning Path</CardTitle>
            <CardDescription>Personalized recommendations based on your progress and interests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">Complete Chest X-Ray Fundamentals</h4>
                  <p className="text-sm text-gray-600">
                    You're 75% through this module. Finish to unlock advanced topics.
                  </p>
                </div>
                <Button size="sm">Continue</Button>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">Start AI-Assisted Radiology</h4>
                  <p className="text-sm text-gray-600">Learn modern AI integration techniques for improved workflow.</p>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Locked
                </Button>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="font-medium">Pediatric Imaging Specialization</h4>
                  <p className="text-sm text-gray-600">Advanced techniques for pediatric radiology cases.</p>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Locked
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

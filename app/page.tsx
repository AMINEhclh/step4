"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { AddGoalForm } from "@/components/goals/add-goal-form"
import { GoalItem } from "@/components/goals/goal-item"
import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { type Goal, getGoalsForDate } from "@/lib/firestore"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [selectedDate] = useState<Date>(new Date())
  const [goals, setGoals] = useState<Goal[]>([])
  const [loadingGoals, setLoadingGoals] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user, selectedDate])

  const loadGoals = async () => {
    if (!user) return

    setLoadingGoals(true)
    try {
      const dateString = selectedDate.toISOString().split("T")[0]
      console.log("[v0] Loading goals for date:", dateString, "user:", user.uid)
      const userGoals = await getGoalsForDate(user.uid, dateString)
      console.log("[v0] Loaded goals:", userGoals)
      setGoals(userGoals)
    } catch (error) {
      console.error("Failed to load goals:", error)
    } finally {
      setLoadingGoals(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const dateString = selectedDate.toISOString().split("T")[0]
  const completedGoals = goals.filter((goal) => goal.completed).length
  const totalGoals = goals.length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Today's Goals</h1>
          <p className="text-muted-foreground">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        </div>

        {totalGoals > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-medium">Progress</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedGoals}/{totalGoals} completed
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Goal Form */}
        <div className="mb-6">
          <AddGoalForm date={dateString} onGoalAdded={loadGoals} />
        </div>

        {/* Goals List */}
        <div className="space-y-3 mb-8">
          {loadingGoals ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : goals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No goals yet</h3>
                <p className="text-muted-foreground">Add your first goal for today</p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => <GoalItem key={goal.id} goal={goal} onUpdate={loadGoals} />)
          )}
        </div>
      </main>

      <footer className="border-t bg-background py-6 mt-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Made by TheUnkownG -- copyright 2025</p>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

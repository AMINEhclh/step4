"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { DateCard } from "@/components/history/date-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, History, TrendingUp, Target } from "lucide-react"
import { getUserGoalDates, getGoalsForDate } from "@/lib/firestore"
import { Toaster } from "@/components/ui/toaster"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [goalDates, setGoalDates] = useState<string[]>([])
  const [loadingDates, setLoadingDates] = useState(false)
  const [stats, setStats] = useState({
    totalDays: 0,
    totalGoals: 0,
    completedGoals: 0,
    averageCompletion: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    if (!user) return

    setLoadingDates(true)
    try {
      const dates = await getUserGoalDates(user.uid)
      setGoalDates(dates)

      // Calculate stats
      let totalGoals = 0
      let completedGoals = 0

      for (const date of dates) {
        const goals = await getGoalsForDate(user.uid, date)
        totalGoals += goals.length
        completedGoals += goals.filter((goal) => goal.completed).length
      }

      setStats({
        totalDays: dates.length,
        totalGoals,
        completedGoals,
        averageCompletion: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
      })
    } catch (error) {
      console.error("Failed to load history:", error)
    } finally {
      setLoadingDates(false)
    }
  }

  const handleViewDate = (date: string) => {
    const dateObj = new Date(date + "T00:00:00")
    router.push(`/?date=${date}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
            <History className="h-8 w-8" />
            Your Goal History
          </h1>
          <p className="text-muted-foreground text-balance">Track your progress and celebrate your achievements</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats.totalDays}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Days with Goals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats.totalGoals}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Goals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats.completedGoals}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Completed Goals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary mb-1">{stats.averageCompletion}%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CalendarIcon className="h-5 w-5" />
                  Goal Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDates ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : goalDates.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No goal history yet</h3>
                    <p className="text-muted-foreground mb-4">Start setting goals to see your progress here</p>
                    <Button onClick={() => router.push("/")}>Set Your First Goal</Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {goalDates.map((date) => (
                      <DateCard key={date} date={date} onViewDate={handleViewDate} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <TrendingUp className="h-5 w-5" />
                  Progress Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.totalGoals > 0 ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Progress</span>
                        <span>{stats.averageCompletion}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.averageCompletion}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Goals per day</span>
                        <span className="font-medium">
                          {stats.totalDays > 0 ? Math.round(stats.totalGoals / stats.totalDays) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active days</span>
                        <span className="font-medium">{stats.totalDays}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Start setting goals to see insights here</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/")}
                >
                  Set Today's Goals
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/community")}
                >
                  View Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-background py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Made by TheUnkownG -- copyright 2025</p>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

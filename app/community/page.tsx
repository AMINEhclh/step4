"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { PublicGoalCard } from "@/components/community/public-goal-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Globe, RefreshCw, Target, TrendingUp } from "lucide-react"
import { type PublicGoal, getPublicGoalsForToday, createOrUpdateUserProfile } from "@/lib/firestore"
import { Toaster } from "@/components/ui/toaster"
import { format } from "date-fns"

export default function CommunityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [publicGoals, setPublicGoals] = useState<PublicGoal[]>([])
  const [loadingGoals, setLoadingGoals] = useState(false)
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      // Update user profile for community features
      createOrUpdateUserProfile(user.uid, user.displayName || "Anonymous", user.photoURL || undefined)
      loadPublicGoals()
    }
  }, [user])

  const loadPublicGoals = async () => {
    setLoadingGoals(true)
    try {
      const goals = await getPublicGoalsForToday()
      setPublicGoals(goals)

      // Calculate stats
      const uniqueUsers = new Set(goals.map((goal) => goal.userId))
      const completedGoals = goals.filter((goal) => goal.completed)

      setStats({
        totalGoals: goals.length,
        completedGoals: completedGoals.length,
        activeUsers: uniqueUsers.size,
      })
    } catch (error) {
      console.error("Failed to load public goals:", error)
    } finally {
      setLoadingGoals(false)
    }
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

  const completionRate = stats.totalGoals > 0 ? Math.round((stats.completedGoals / stats.totalGoals) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
            <Users className="h-8 w-8" />
            Community Goals
          </h1>
          <p className="text-muted-foreground text-balance">See what others are working on today and get inspired</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="outline" className="text-sm">
              <Globe className="h-3 w-3 mr-1" />
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stats.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stats.totalGoals}</div>
              <div className="text-sm text-muted-foreground">Public Goals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{stats.completedGoals}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{completionRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Today's Public Goals
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={loadPublicGoals} disabled={loadingGoals}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loadingGoals ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingGoals ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : publicGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No public goals yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share your goals with the community!</p>
                    <Button onClick={() => router.push("/")}>Share Your Goals</Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {publicGoals.map((goal) => (
                      <PublicGoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.totalGoals > 0 ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Community Progress</span>
                        <span>{completionRate}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Goals per user</span>
                        <span className="font-medium">
                          {stats.activeUsers > 0 ? Math.round(stats.totalGoals / stats.activeUsers) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completion rate</span>
                        <span className="font-medium">{completionRate}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Community stats will appear when users share goals</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Share Your Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Make your goals public to inspire others and stay accountable to the community.
                </p>
                <div className="space-y-2">
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
                    onClick={() => router.push("/history")}
                  >
                    View Your History
                  </Button>
                </div>
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

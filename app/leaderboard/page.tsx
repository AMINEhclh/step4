"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllUsersForLeaderboard, type UserProfile } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"

export default function LeaderboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    const fetchUsers = async () => {
      try {
        const leaderboardUsers = await getAllUsersForLeaderboard()
        setUsers(leaderboardUsers)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, router])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Streak Leaderboard</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            See who has the longest daily goal completion streaks
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Community Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">{users.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {users.length > 0 ? Math.max(...users.map((u) => u.streak || 0)) : 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Highest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {users.filter((u) => (u.streak || 0) > 0).length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Streaks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                No users found. Be the first to start your streak!
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {users.map((userProfile, index) => {
                  const rank = index + 1
                  const isCurrentUser = user?.uid === userProfile.userId

                  return (
                    <div
                      key={userProfile.userId}
                      className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-colors ${
                        isCurrentUser ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="flex items-center justify-center w-8 sm:w-12 flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium flex items-center gap-2 text-sm sm:text-base">
                            <span className="truncate">{userProfile.displayName}</span>
                            {isCurrentUser && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded flex-shrink-0">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">Rank #{rank}</div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-bold">
                          {(userProfile.streak || 0) > 0 ? (
                            <>
                              <span className="text-orange-500">🔥</span>
                              <span>{userProfile.streak || 0}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {(userProfile.streak || 0) === 1 ? "day" : "days"}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center text-xs sm:text-sm text-muted-foreground border-t pt-6 sm:pt-8">
          Made by TheUnkownG -- copyright 2025
        </footer>
      </div>
    </div>
  )
}

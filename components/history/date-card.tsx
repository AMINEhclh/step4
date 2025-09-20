"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Calendar, Target, CheckCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { type Goal, getGoalsForDate } from "@/lib/firestore"
import { useAuth } from "@/lib/auth-context"

interface DateCardProps {
  date: string
  onViewDate: (date: string) => void
}

export function DateCard({ date, onViewDate }: DateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (isExpanded && user) {
      loadGoals()
    }
  }, [isExpanded, user, date])

  const loadGoals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const userGoals = await getGoalsForDate(user.uid, date)
      setGoals(userGoals)
    } catch (error) {
      console.error("Failed to load goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const completedGoals = goals.filter((goal) => goal.completed).length
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

  const parsedDate = parseISO(date)
  const isToday = date === new Date().toISOString().split("T")[0]
  const isTomorrow = date === new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-auto mt-1 flex-shrink-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{format(parsedDate, "EEEE, MMMM d")}</span>
                {isToday && (
                  <Badge variant="default" className="text-xs">
                    Today
                  </Badge>
                )}
                {isTomorrow && (
                  <Badge variant="secondary" className="text-xs">
                    Tomorrow
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{format(parsedDate, "yyyy")}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
            {totalGoals > 0 && (
              <div className="text-right">
                <div className="text-xs sm:text-sm font-medium">
                  {completedGoals}/{totalGoals}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">{completionRate}% success</div>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={() => onViewDate(date)} className="text-xs px-2 py-1">
              View
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No goals for this date</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <CheckCircle
                    className={`h-4 w-4 flex-shrink-0 ${goal.completed ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-xs sm:text-sm flex-1 ${goal.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {goal.text}
                  </span>
                  {goal.isPublic && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      Public
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Target } from "lucide-react"
import type { PublicGoal } from "@/lib/firestore"
import { format } from "date-fns"

interface PublicGoalCardProps {
  goal: PublicGoal
}

export function PublicGoalCard({ goal }: PublicGoalCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={goal.userAvatar || ""} alt={goal.userName} />
            <AvatarFallback>{goal.userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{goal.userName}</p>
                {goal.userStreak && goal.userStreak > 0 && (
                  <span className="flex items-center gap-1 text-orange-500 font-medium text-xs">
                    🔥 {goal.userStreak}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {format(goal.createdAt.toDate(), "h:mm a")}
              </Badge>
            </div>

            <div className="flex items-start gap-2">
              {goal.completed ? (
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${goal.completed ? "line-through text-muted-foreground" : ""}`}>{goal.text}</p>
            </div>
          </div>

          {goal.completed && (
            <Badge variant="default" className="text-xs">
              Completed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

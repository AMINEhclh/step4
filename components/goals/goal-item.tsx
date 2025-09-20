"use client"

import { useState } from "react"
import type { Goal } from "@/lib/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Trash2, Edit2, Check, X, Globe, Lock } from "lucide-react"
import { updateGoalCompletion, updateGoalText, updateGoalPrivacy, deleteGoal } from "@/lib/firestore"
import { useToast } from "@/hooks/use-toast"

interface GoalItemProps {
  goal: Goal
  onUpdate: () => void
}

export function GoalItem({ goal, onUpdate }: GoalItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(goal.text)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleToggleComplete = async () => {
    setLoading(true)
    try {
      await updateGoalCompletion(goal.id, !goal.completed)
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (editText.trim() === "") return

    setLoading(true)
    try {
      await updateGoalText(goal.id, editText.trim())
      setIsEditing(false)
      onUpdate()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(goal.text)
    setIsEditing(false)
  }

  const handleTogglePrivacy = async () => {
    setLoading(true)
    try {
      await updateGoalPrivacy(goal.id, !goal.isPublic)
      onUpdate()
      toast({
        title: goal.isPublic ? "Goal made private" : "Goal made public",
        description: goal.isPublic ? "Your goal is now private" : "Your goal is now visible in the community feed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update goal privacy",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteGoal(goal.id)
      onUpdate()
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={goal.completed}
          onCheckedChange={handleToggleComplete}
          disabled={loading}
          className="mt-0.5"
        />

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSaveEdit} disabled={loading}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={loading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className={`text-sm ${goal.completed ? "line-through text-muted-foreground" : ""}`}>{goal.text}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleTogglePrivacy}
            disabled={loading}
            title={goal.isPublic ? "Make private" : "Make public"}
          >
            {goal.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </Button>

          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} disabled={loading || isEditing}>
            <Edit2 className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

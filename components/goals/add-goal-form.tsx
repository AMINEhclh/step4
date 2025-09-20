"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { addGoal } from "@/lib/firestore"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface AddGoalFormProps {
  date: string
  onGoalAdded: () => void
}

export function AddGoalForm({ date, onGoalAdded }: AddGoalFormProps) {
  const [goalText, setGoalText] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalText.trim() || !user) return

    setLoading(true)
    try {
      console.log("[v0] Adding goal for user:", user.uid, "date:", date) // Added debug logging
      await addGoal(user.uid, goalText.trim(), date, isPublic)
      console.log("[v0] Goal added successfully") // Added debug logging
      setGoalText("")
      setIsPublic(false)
      onGoalAdded()
      toast({
        title: "Goal added!",
        description: "Your goal has been added to your list",
      })
    } catch (error) {
      console.error("[v0] Error adding goal:", error) // Added debug logging
      toast({
        title: "Error",
        description: "Failed to add goal. Please check console for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What do you want to accomplish?"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !goalText.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="public-goal" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="public-goal" className="text-sm text-muted-foreground">
              Share publicly in community feed
            </Label>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

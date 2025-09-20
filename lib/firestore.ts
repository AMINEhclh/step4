import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Goal {
  id: string
  userId: string
  text: string
  completed: boolean
  createdAt: Timestamp
  date: string // YYYY-MM-DD format
  isPublic: boolean
}

export interface PublicGoal extends Goal {
  userName: string
  userAvatar?: string
  userStreak?: number
}

export interface UserProfile {
  userId: string
  displayName: string
  photoURL?: string
  streak: number
  lastCompletionDate?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Get goals for a specific date
export async function getGoalsForDate(userId: string, date: string): Promise<Goal[]> {
  console.log("[v0] Fetching goals for userId:", userId, "date:", date)

  const goalsRef = collection(db, "goals")
  const q = query(goalsRef, where("userId", "==", userId), where("date", "==", date))

  try {
    const querySnapshot = await getDocs(q)
    console.log("[v0] Found", querySnapshot.docs.length, "goals")

    const goals = querySnapshot.docs.map((doc) => {
      const data = doc.data()
      console.log("[v0] Goal data:", data)
      return {
        id: doc.id,
        ...data,
      } as Goal
    })

    goals.sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())

    return goals
  } catch (error) {
    console.error("[v0] Error fetching goals:", error)
    throw error
  }
}

// Add a new goal
export async function addGoal(userId: string, text: string, date: string, isPublic = false): Promise<string> {
  const goalsRef = collection(db, "goals")
  const docRef = await addDoc(goalsRef, {
    userId,
    text,
    completed: false,
    createdAt: Timestamp.now(),
    date,
    isPublic,
  })
  return docRef.id
}

// Update goal completion status
export async function updateGoalCompletion(goalId: string, completed: boolean): Promise<void> {
  const goalRef = doc(db, "goals", goalId)
  await updateDoc(goalRef, { completed })

  // If goal is being completed, update user streak
  if (completed) {
    const goalDoc = await getDoc(goalRef)
    const goalData = goalDoc.data()
    if (goalData) {
      await updateUserStreak(goalData.userId, goalData.date)
    }
  }
}

// Update goal text
export async function updateGoalText(goalId: string, text: string): Promise<void> {
  const goalRef = doc(db, "goals", goalId)
  await updateDoc(goalRef, { text })
}

// Update goal privacy
export async function updateGoalPrivacy(goalId: string, isPublic: boolean): Promise<void> {
  const goalRef = doc(db, "goals", goalId)
  await updateDoc(goalRef, { isPublic })
}

// Delete a goal
export async function deleteGoal(goalId: string): Promise<void> {
  const goalRef = doc(db, "goals", goalId)
  await deleteDoc(goalRef)
}

// Get all dates with goals for a user
export async function getUserGoalDates(userId: string): Promise<string[]> {
  const goalsRef = collection(db, "goals")
  const q = query(goalsRef, where("userId", "==", userId))

  const querySnapshot = await getDocs(q)
  const dates = new Set<string>()

  querySnapshot.docs.forEach((doc) => {
    const data = doc.data()
    dates.add(data.date)
  })

  return Array.from(dates).sort().reverse()
}

// Get public goals for today
export async function getPublicGoalsForToday(): Promise<PublicGoal[]> {
  console.log("[v0] Fetching public goals for today")
  const today = new Date().toISOString().split("T")[0]
  console.log("[v0] Today's date:", today)

  const goalsRef = collection(db, "goals")
  const q = query(goalsRef, where("date", "==", today), where("isPublic", "==", true))

  try {
    const querySnapshot = await getDocs(q)
    console.log("[v0] Found", querySnapshot.docs.length, "public goals")

    const goals: PublicGoal[] = []

    for (const goalDoc of querySnapshot.docs) {
      const goalData = goalDoc.data()
      console.log("[v0] Processing public goal:", goalData)

      try {
        // Get user info
        const userRef = doc(db, "users", goalData.userId)
        const userDoc = await getDoc(userRef)
        const userData = userDoc.data()
        console.log("[v0] User data for goal:", userData)

        goals.push({
          id: goalDoc.id,
          ...goalData,
          userName: userData?.displayName || "Anonymous",
          userAvatar: userData?.photoURL,
          userStreak: userData?.streak || 0,
        } as PublicGoal)
      } catch (userError) {
        console.error("[v0] Error fetching user data for goal:", userError)
        goals.push({
          id: goalDoc.id,
          ...goalData,
          userName: "Anonymous",
          userAvatar: undefined,
          userStreak: 0,
        } as PublicGoal)
      }
    }

    goals.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    console.log("[v0] Returning", goals.length, "public goals")

    return goals
  } catch (error) {
    console.error("[v0] Error fetching public goals:", error)
    throw error
  }
}

// Create or update user profile
export async function createOrUpdateUserProfile(userId: string, displayName: string, photoURL?: string): Promise<void> {
  const userRef = doc(db, "users", userId)

  try {
    await updateDoc(userRef, {
      displayName,
      photoURL: photoURL || null,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    // If document doesn't exist, create it with the userId as document ID
    await setDoc(userRef, {
      userId,
      displayName,
      photoURL: photoURL || null,
      streak: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }
}

// Update user streak
export async function updateUserStreak(userId: string, completionDate: string): Promise<void> {
  const userRef = doc(db, "users", userId)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) return

  const userData = userDoc.data()
  const currentStreak = userData.streak || 0
  const lastCompletionDate = userData.lastCompletionDate

  // Calculate new streak
  let newStreak = currentStreak

  if (!lastCompletionDate) {
    // First completion
    newStreak = 1
  } else {
    const lastDate = new Date(lastCompletionDate)
    const currentDate = new Date(completionDate)
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 1) {
      // Consecutive day
      newStreak = currentStreak + 1
    } else if (daysDiff === 0) {
      // Same day, keep current streak
      newStreak = currentStreak
    } else {
      // Streak broken, reset to 1
      newStreak = 1
    }
  }

  await updateDoc(userRef, {
    streak: newStreak,
    lastCompletionDate: completionDate,
    updatedAt: Timestamp.now(),
  })
}

// Get user profile with streak
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", userId)
  const userDoc = await getDoc(userRef)

  if (!userDoc.exists()) return null

  return userDoc.data() as UserProfile
}

// Get all users sorted by streak for leaderboard
export async function getAllUsersForLeaderboard(): Promise<UserProfile[]> {
  const usersRef = collection(db, "users")

  try {
    const querySnapshot = await getDocs(usersRef)
    const users: UserProfile[] = []

    querySnapshot.docs.forEach((doc) => {
      const userData = doc.data() as UserProfile
      userData.streak = userData.streak || 0
      users.push(userData)
    })

    users.sort((a, b) => {
      const streakA = a.streak || 0
      const streakB = b.streak || 0

      // Primary sort: by streak descending
      if (streakB !== streakA) {
        return streakB - streakA
      }

      // Secondary sort: by display name ascending for consistent ordering
      return a.displayName.localeCompare(b.displayName)
    })

    console.log(
      "[v0] Leaderboard users sorted:",
      users.map((u) => ({ name: u.displayName, streak: u.streak })),
    )

    return users
  } catch (error) {
    console.error("Error fetching users for leaderboard:", error)
    throw error
  }
}

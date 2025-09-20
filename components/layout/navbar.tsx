"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Home, History, Users, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserProfile, type UserProfile } from "@/lib/firestore"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(setUserProfile)
    } else {
      setUserProfile(null)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth")
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/history", label: "History", icon: History },
    { href: "/community", label: "Community", icon: Users },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  return (
    <>
      <nav className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-primary">
                {"STEP2"}
              </Link>

              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                        pathname === item.href ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <span className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-none">
                      {user.displayName || user.email}
                    </span>
                    {userProfile && userProfile.streak > 0 && (
                      <span className="flex items-center gap-1 text-orange-500 font-medium whitespace-nowrap">
                        🔥 {userProfile.streak}
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-xs sm:text-sm bg-transparent"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                    <span className="sm:hidden">Out</span>
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm" className="text-xs sm:text-sm">
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-2 text-xs transition-colors min-w-0 ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <IconComponent className="h-5 w-5 mb-1" />
                <span className="text-[10px] leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="md:hidden h-16" />
    </>
  )
}

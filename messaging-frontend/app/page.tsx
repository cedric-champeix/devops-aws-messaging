"use client"

import { useEffect, useState } from "react"
import { LoginForm } from "@/components/login-form"
import { ChatInterface } from "@/components/chat-interface"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated (session exists)
    const checkAuth = () => {
      const token = sessionStorage.getItem("auth_token")
      const userId = sessionStorage.getItem("user_id")

      if (token && userId) {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleLogin = (userId: string, token: string) => {
    sessionStorage.setItem("auth_token", token)
    sessionStorage.setItem("user_id", userId)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("auth_token")
    sessionStorage.removeItem("user_id")
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? <ChatInterface onLogout={handleLogout} /> : <LoginForm onLogin={handleLogin} />}
    </div>
  )
}

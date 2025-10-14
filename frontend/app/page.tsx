"use client"

import { LoginRedirect } from "@/components/LoginRedirect"
import { UserChat } from "@/components/UserChat/"
import { useAuth } from "react-oidc-context"

export default function HomePage() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (auth.error) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-red-500">Error: {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return <UserChat onLogout={() => {
      auth.removeUser();
      auth.signoutRedirect();
    }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <LoginRedirect handleLogin={() => auth.signinRedirect()} />
    </div>
  )
}

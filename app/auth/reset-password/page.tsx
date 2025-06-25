"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"

import Link from "next/link"
import { useState } from "react"
import { HeaderGoBack } from "../../components/header-go-back"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setMessage(null)

      const { error } = await resetPassword(supabase, email)
      
      if (error) throw error

      setMessage("Check your email for the password reset link!")
      setEmail("")
    } catch (err: unknown) {
      console.error("Password reset error:", err)
      setError(
        (err as Error).message ||
          "An unexpected error occurred. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background flex h-dvh w-full flex-col">
      <HeaderGoBack href="/auth" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Reset Password
            </h1>
            <p className="text-muted-foreground mt-3">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-500/10 text-green-500 rounded-md p-3 text-sm">
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button
              type="submit"
              variant="default"
              className="w-full text-base sm:text-base"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            
            <div className="text-center">
              <Link
                href="/auth"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
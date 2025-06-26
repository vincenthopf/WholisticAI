"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithEmail, signUpWithEmail } from "@/lib/api"
import { MODEL_DEFAULT } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"

import Link from "next/link"
import { useState } from "react"
import { HeaderGoBack } from "../components/header-go-back"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    if (!supabase) {
      setError("Supabase is not configured")
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      if (isSignUp) {
        const { data, error } = await signUpWithEmail(supabase, email, password)
        if (error) throw error
        
        // Create user profile in the database
        if (data?.user) {
          const { error: profileError } = await supabase
            .from("users")
            .insert({
              id: data.user.id,
              email: data.user.email!,
              anonymous: false,
              message_count: 0,
              daily_message_count: 0,
              premium: false,
              favorite_models: [MODEL_DEFAULT],
              created_at: new Date().toISOString(),
            })
          
          if (profileError && profileError.code !== "23505") {
            console.error("Error creating user profile:", profileError)
          }
        }
        
        // For email/password auth, auto-confirm is usually enabled in Supabase
        // If email confirmation is required, show message
        if (data?.user && !data.user.email_confirmed_at) {
          setError("Check your email to confirm your account!")
          setIsSignUp(false)
        } else {
          // Auto-confirmed, redirect immediately
          window.location.href = "/"
        }
      } else {
        const { data, error } = await signInWithEmail(supabase, email, password)
        if (error) throw error
        
        // Check if user profile exists, create if not
        if (data?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("id")
            .eq("id", data.user.id)
            .single()
          
          if (!profile) {
            // Create profile for existing auth user
            await supabase
              .from("users")
              .insert({
                id: data.user.id,
                email: data.user.email!,
                anonymous: false,
                message_count: 0,
                daily_message_count: 0,
                premium: false,
                favorite_models: [MODEL_DEFAULT],
                created_at: new Date().toISOString(),
              })
          }
        }
        
        // Redirect to home on successful login with full page reload
        window.location.href = "/"
      }
    } catch (err: unknown) {
      console.error("Authentication error:", err)
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
      <HeaderGoBack href="/" />

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Welcome to WholisticAI
            </h1>
            <p className="text-muted-foreground mt-3">
              {isSignUp ? "Create an account" : "Sign in"} to increase your message limits.
            </p>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            )}
            <Button
              type="submit"
              variant="default"
              className="w-full text-base sm:text-base"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
            {!isSignUp && (
              <div className="text-center">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </form>
        </div>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        {/* @todo */}
        <p>
          By continuing, you agree to our{" "}
          <Link href="/" className="text-foreground hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="text-foreground hover:underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  )
}

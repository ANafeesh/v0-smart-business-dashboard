'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Coffee, Sparkles } from 'lucide-react'

// Demo credentials
const DEMO_EMAIL = 'demo@smartbusiness.com'
const DEMO_PASSWORD = 'demo123456'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Sign in with pre-created demo account
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
      
      if (signInError) throw signInError
      
      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Coffee className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Smart Business</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to access your business dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Login Button */}
              <Button 
                type="button"
                onClick={handleDemoLogin}
                className="w-full gap-2"
                disabled={isLoading}
              >
                <Sparkles className="h-4 w-4" />
                {isLoading ? 'Signing in...' : 'Enter with Demo Account'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or use your credentials
                  </span>
                </div>
              </div>

              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      {error}
                    </p>
                  )}
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Demo Credentials:</p>
            <p>Email: {DEMO_EMAIL}</p>
            <p>Password: {DEMO_PASSWORD}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

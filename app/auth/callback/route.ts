import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle error from Supabase
  if (error) {
    console.log('[v0] Auth error from Supabase:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.log('[v0] Code exchange error:', exchangeError.message)
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent(exchangeError.message)}`
      )
    }
    
    // Success - redirect to dashboard
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code provided
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent('No authorization code provided')}`)
}

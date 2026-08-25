'use client'

import type { ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BrandMark } from './BrandMark'
import { SignInScreen } from './SignInScreen'

export function AuthGate({ children, logoUrl }: { children: ReactNode; logoUrl?: string }) {
  const { status } = useAuth()

  if (status === 'loading') {
    return <div className="auth-loading">Loading…</div>
  }

  if (status === 'not-configured') {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <BrandMark logoUrl={logoUrl} />
          <h1>Set up Firebase first</h1>
          <p>
            Copy <code>.env.local.example</code> to <code>.env.local</code> and fill in your Firebase project&apos;s
            web app config (console.firebase.google.com → Project Settings → Your apps). See DEPLOY.md for the full
            walkthrough.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'signed-out' || status === 'unauthorized') {
    return <SignInScreen logoUrl={logoUrl} />
  }

  return <>{children}</>
}

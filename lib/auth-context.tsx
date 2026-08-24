'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, configError, ALLOWED_EMAIL } from './firebase'

type AuthStatus = 'loading' | 'signed-out' | 'unauthorized' | 'signed-in' | 'not-configured'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  error: string | null
  signIn: () => void
  signOutUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (configError) {
      setStatus('not-configured')
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.email === ALLOWED_EMAIL) {
        setUser(u)
        setStatus('signed-in')
      } else if (u) {
        // Signed in with the wrong account — kick them out immediately.
        setUser(null)
        setStatus('unauthorized')
        void signOut(auth)
      } else {
        setUser(null)
        setStatus('signed-out')
      }
    })
    return () => unsub()
  }, [])

  function signIn() {
    setError(null)
    const provider = new GoogleAuthProvider()
    if (ALLOWED_EMAIL) provider.setCustomParameters({ login_hint: ALLOWED_EMAIL })
    signInWithPopup(auth, provider).catch((e) => setError(e.message))
  }

  function signOutUser() {
    void signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ status, user, error, signIn, signOutUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Every consumer of `auth`/`db` lives behind 'use client' + useEffect, so
// these are only ever touched in the browser. Guarding init like this keeps
// server-side rendering/prerendering (which also evaluates this module) from
// crashing when .env.local is still unfilled during initial setup.
const isBrowser = typeof window !== 'undefined'

let _app: FirebaseApp | undefined
let _auth: Auth | undefined
let _db: Firestore | undefined

// Also caught (not just guarded by isBrowser): an empty/placeholder
// NEXT_PUBLIC_FIREBASE_API_KEY throws synchronously from getAuth(), which
// would otherwise take down the whole page on first load. `configError` lets
// AuthProvider show a friendly "fill in .env.local" screen instead of a
// crash — this is the expected state right after `git clone`.
export let configError: string | null = null

if (isBrowser) {
  try {
    if (!firebaseConfig.apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not set')
    _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    _auth = getAuth(_app)
    _db = getFirestore(_app)
  } catch (e) {
    configError = e instanceof Error ? e.message : String(e)
  }
}

export const firebaseApp = _app as FirebaseApp
export const auth = _auth as Auth
export const db = _db as Firestore

export const ALLOWED_EMAIL = process.env.NEXT_PUBLIC_ALLOWED_EMAIL ?? ''

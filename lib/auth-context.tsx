'use client'

import React from "react"

import { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { subscribeToAuthState, getUserProfile } from '@/lib/auth'
import type { User } from '@/lib/types'

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid)
          setUserProfile(profile)
        } catch {
          // Firestore rules not deployed yet -- auth still works
          console.warn('Firestore profile fetch failed. Deploy your firestore.rules to Firebase Console.')
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    loading,
    isAuthenticated: !!firebaseUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

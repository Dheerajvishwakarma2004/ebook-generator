'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [bio, setBio] = useState('')
  const [accountType, setAccountType] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!firebaseUser) {
    router.push('/signup')
    return null
  }

  const handleComplete = async () => {
    setError('')
    setLoading(true)

    try {
      await updateUserProfile(firebaseUser.uid, {
        bio,
        accountType,
      })
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Let's set up your account. Choose how you'd like to use eBook Generator.
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
            )}

            {/* Account Type Selection */}
            <div>
              <label className="mb-4 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Account Type
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Free Tier */}
                <button
                  onClick={() => setAccountType('free')}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    accountType === 'free'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Free Creator</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Create and use templates, earn revenue from your published templates
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        accountType === 'free'
                          ? 'border-accent bg-accent'
                          : 'border-border'
                      }`}
                    >
                      {accountType === 'free' && (
                        <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Premium Tier */}
                <button
                  onClick={() => setAccountType('premium')}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    accountType === 'premium'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-foreground/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">Premium Creator</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        AI-powered template builder, advanced customization, higher revenue share
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        accountType === 'premium'
                          ? 'border-accent bg-accent'
                          : 'border-border'
                      }`}
                    >
                      {accountType === 'premium' && (
                        <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Bio (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                className="mt-2 h-24 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none resize-none"
                placeholder="Tell us about yourself and your template creations..."
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {bio.length}/160 characters
              </p>
            </div>

            <Button
              onClick={handleComplete}
              disabled={loading}
              className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

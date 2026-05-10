'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { updateUserProfile } from '@/lib/auth'
import { Button } from '@/components/ui/button'

type OnboardingStep = 'guide' | 'role-select' | 'profile'

export default function OnboardingPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [step, setStep] = useState<OnboardingStep>('guide')
  const [bio, setBio] = useState('')
  const [userRole, setUserRole] = useState<'creator' | 'regular'>('regular')
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

  const handleSkipGuide = () => {
    setStep('role-select')
  }

  const handleRoleSelect = () => {
    setStep('profile')
  }

  const handleBackToRole = () => {
    setStep('role-select')
  }

  const handleComplete = async () => {
    setError('')
    setLoading(true)

    try {
      await updateUserProfile(firebaseUser.uid, {
        bio,
        accountType,
        userRole,
        hasSeenGuide: true,
      })
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Beginner's Guide
  if (step === 'guide') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                <svg className="h-8 w-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to eBook Generator!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Let's walk you through the key features
              </p>
            </div>

            <div className="space-y-6">
              {/* Feature cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: '📚',
                    title: 'Create eBooks',
                    description: 'Design beautiful ebooks using pre-made templates or create your own custom templates'
                  },
                  {
                    icon: '🎨',
                    title: 'Customize Templates',
                    description: 'Adjust positions, styles, and content to match your brand and vision'
                  },
                  {
                    icon: '💰',
                    title: 'Earn Revenue',
                    description: 'Share your templates and earn commission every time someone uses them'
                  },
                  {
                    icon: '🚀',
                    title: 'Go Premium (Optional)',
                    description: 'Unlock AI-powered template creation and advanced features'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4 rounded-lg border border-border/50 bg-background p-4">
                    <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{feature.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info box */}
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                <p className="text-xs text-foreground">
                  <span className="font-semibold">Need help?</span> You can always access guides and tutorials from your dashboard.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSkipGuide}
                  variant="outline"
                  className="flex-1 rounded-lg"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSkipGuide}
                  className="flex-1 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: User Role Selection
  if (step === 'role-select') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="mb-8">
              <div className="mb-4 text-center">
                <h1 className="text-3xl font-bold text-foreground">How do you want to use eBook Generator?</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Choose your role to get started
                </p>
              </div>
              <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-accent transition-all" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Regular User */}
              <button
                onClick={() => setUserRole('regular')}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  userRole === 'regular'
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Regular User</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Use templates from the library to create beautiful ebooks. Access the template marketplace and customize templates for your own use.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <li>✓ Browse and use templates</li>
                      <li>✓ Create and edit ebooks</li>
                      <li>✓ Suggest improvements to templates</li>
                    </ul>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      userRole === 'regular'
                        ? 'border-accent bg-accent'
                        : 'border-border'
                    }`}
                  >
                    {userRole === 'regular' && (
                      <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                    )}
                  </div>
                </div>
              </button>

              {/* Creator */}
              <button
                onClick={() => setUserRole('creator')}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  userRole === 'creator'
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">Creator</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create and publish templates that other users can use. Build a portfolio and earn commission from template usage.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <li>✓ Create custom templates</li>
                      <li>✓ Publish templates to marketplace</li>
                      <li>✓ Earn revenue from usage</li>
                      <li>✓ View analytics and earnings</li>
                    </ul>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      userRole === 'creator'
                        ? 'border-accent bg-accent'
                        : 'border-border'
                    }`}
                  >
                    {userRole === 'creator' && (
                      <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                    )}
                  </div>
                </div>
              </button>

              <Button
                onClick={handleRoleSelect}
                className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-all hover:bg-accent/90"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Profile Setup
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="mb-8">
            <div className="mb-4 text-center">
              <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us a bit more about yourself
              </p>
            </div>
            <div className="h-1 w-full bg-border rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-accent transition-all" />
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
            )}

            {/* Account Type Selection - Only show for creators */}
            {userRole === 'creator' && (
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
                        <h3 className="font-semibold text-foreground">Free</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Create templates, earn revenue
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
                        <h3 className="font-semibold text-foreground">Premium</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          AI builder + advanced features
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
            )}

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
                placeholder={userRole === 'creator' ? "Tell us about yourself and your template creations..." : "Tell us about yourself..."}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {bio.length}/160 characters
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBackToRole}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 rounded-lg bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

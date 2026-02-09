'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getUserTemplates, getUserProjects } from '@/lib/firestore'
import { logOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import type { Template, UserProject } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const { firebaseUser, userProfile, loading: authLoading } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [projects, setProjects] = useState<UserProject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects')

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return

    if (!firebaseUser) {
      router.push('/login')
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        const [userTemplates, userProjects] = await Promise.all([
          getUserTemplates(firebaseUser.uid),
          getUserProjects(firebaseUser.uid),
        ])
        setTemplates(userTemplates)
        setProjects(userProjects)
      } catch (error) {
        console.warn('Failed to load data (Firestore rules may not be deployed):', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [firebaseUser, authLoading, router])

  const handleLogout = async () => {
    try {
      await logOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Welcome, {userProfile?.displayName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {userProfile?.accountType === 'premium' ? '⭐ Premium' : 'Free'}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  ${userProfile?.totalEarnings.toFixed(2) || '0.00'}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-xs font-semibold bg-transparent"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'projects'
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              My Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'templates'
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              My Templates ({templates.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="text-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : activeTab === 'projects' ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">My Projects</h2>
              <Link href="/editor">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  New Project
                </Button>
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects yet. Start creating!
                </p>
                <Link href="/editor">
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:shadow-lg">
                      <h3 className="font-semibold text-foreground group-hover:text-accent">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        by {project.author}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-foreground/10 px-2 py-1">
                          {project.chapters.length} chapters
                        </span>
                        <span className="rounded-full bg-foreground/10 px-2 py-1">
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">My Templates</h2>
              <Link href="/template-builder">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Create Template
                </Button>
              </Link>
            </div>

            {templates.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No templates yet. Create one and start earning!
                </p>
                <Link href="/template-builder">
                  <Button variant="outline" className="mt-4 bg-transparent">
                    Create Your First Template
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div key={template.id} className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:shadow-lg">
                    <h3 className="font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <div className="flex gap-2">
                        <span className="rounded-full bg-foreground/10 px-2 py-1">
                          {template.usageCount} uses
                        </span>
                        <span className={`rounded-full px-2 py-1 ${
                          template.isPublished
                            ? 'bg-green-500/10 text-green-700'
                            : 'bg-yellow-500/10 text-yellow-700'
                        }`}>
                          {template.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    {template.isPublished && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {template.revenuePercentage}% revenue share
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

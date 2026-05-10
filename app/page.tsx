'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { templates, type EBookTemplate } from '@/lib/templates'
import TemplateCard from '@/components/template-card'
import { Button } from '@/components/ui/button'

const categories = ['All', ...Array.from(new Set(templates.map((t) => t.category)))]

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? templates
    : templates.filter((t) => t.category === activeCategory)

  const handleSelectTemplate = (template: EBookTemplate) => {
    // Authentication bypass - allow template selection without login
    // if (!isAuthenticated) {
    //   router.push('/login?redirect=/editor&template=' + template.id)
    //   return
    // }
    sessionStorage.setItem('selected-template', JSON.stringify(template))
    router.push(`/editor?template=${template.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <svg className="h-5 w-5 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <button onClick={() => router.push('/')} className="text-lg font-bold text-foreground hover:text-accent transition-colors">
              eBook Generator
            </button>
          </div>

          <nav className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 bg-foreground/10 rounded animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="rounded-lg bg-transparent"
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="rounded-lg bg-transparent"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
                <Button
                  className="rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => router.push('/signup')}
                >
                  Create Account
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Pick a template.
            <br />
            Create your eBook.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            Choose from professionally designed templates, add your content, and compile a beautifully typeset eBook in seconds.
          </p>
          {!isAuthenticated && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="rounded-lg bg-transparent"
                onClick={() => router.push('/login')}
              >
                Sign In to Start
              </Button>
              <Button
                className="rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => router.push('/signup')}
              >
                Create Free Account
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-foreground text-background'
                  : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {!isAuthenticated && (
          <div className="mb-8 rounded-lg border border-accent/30 bg-accent/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in to browse templates and create your first eBook
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelectTemplate}
              requiresAuth={!isAuthenticated}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No templates found in this category.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        No-Code eBook Generator -- Powered by LaTeX
      </footer>
    </div>
  )
}




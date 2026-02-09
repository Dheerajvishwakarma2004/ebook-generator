'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getTemplate, publishTemplate, updateTemplate } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import type { Template } from '@/lib/types'

export default function TemplateEditPage() {
  const router = useRouter()
  const params = useParams()
  const { firebaseUser, loading: authLoading } = useAuth()
  const templateId = params.id as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [revenuePercentage, setRevenuePercentage] = useState(30)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!firebaseUser) {
      router.push('/login')
      return
    }

    const loadTemplate = async () => {
      try {
        const tmpl = await getTemplate(templateId)
        if (!tmpl) {
          setError('Template not found')
          return
        }
        if (tmpl.creatorId !== firebaseUser.uid) {
          setError('You do not have permission to edit this template')
          return
        }
        setTemplate(tmpl)
        setRevenuePercentage(tmpl.revenuePercentage)
        setTags(tmpl.tags)
      } catch (err) {
        setError('Failed to load template')
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
  }, [firebaseUser, templateId, router])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handlePublish = async () => {
    if (!template) return
    setError('')
    setSuccess('')
    setPublishing(true)

    try {
      // Update tags
      await updateTemplate(templateId, { tags })
      // Publish with revenue percentage
      await publishTemplate(templateId, revenuePercentage)
      setSuccess('Template published successfully!')
      setTemplate({ ...template, isPublished: true, revenuePercentage, tags })
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish'
      setError(message)
    } finally {
      setPublishing(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error && !template) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-lg border border-border bg-card p-6 text-center max-w-md">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!template) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{template.name}</h1>
          <p className="mt-2 text-muted-foreground">{template.description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              template.isPublished
                ? 'bg-green-500/10 text-green-700'
                : 'bg-yellow-500/10 text-yellow-700'
            }`}>
              {template.isPublished ? '✓ Published' : 'Draft'}
            </span>
            <span className="text-xs text-muted-foreground">
              {template.usageCount} uses
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Preview Card */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Template Preview</h2>
              <div className="rounded-lg bg-[#e0e0e0] p-4">
                <div className="bg-white rounded p-4 text-center" style={{ aspectRatio: '2/3' }}>
                  <p className="text-sm font-semibold text-foreground">{template.defaultContent.title}</p>
                  <p className="text-xs text-muted-foreground mt-2">{template.defaultContent.author}</p>
                </div>
              </div>
            </div>

            {/* Template Details */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Cover Style</h3>
                <p className="text-sm text-muted-foreground capitalize">{template.coverStyle}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Fonts</h3>
                <p className="text-sm text-muted-foreground">
                  Heading: {template.fonts.heading}
                </p>
                <p className="text-sm text-muted-foreground">
                  Body: {template.fonts.body}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Accent Color</h3>
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg border border-border"
                    style={{ backgroundColor: template.accentColor }}
                  />
                  <p className="text-sm text-muted-foreground">{template.accentColor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Publish Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-border bg-card p-6 sticky top-6 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Publish Settings</h2>

              {template.isPublished ? (
                <div className="rounded-lg bg-green-500/10 p-4">
                  <p className="text-sm font-semibold text-green-700">Published</p>
                  <p className="text-xs text-green-600 mt-1">
                    Your template is live and earning revenue!
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Revenue Share (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={revenuePercentage}
                      onChange={(e) => setRevenuePercentage(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll earn {revenuePercentage}% from each template use
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Add tag..."
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                      />
                      <Button
                        onClick={handleAddTag}
                        variant="outline"
                        className="px-3 bg-transparent"
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleRemoveTag(tag)}
                          className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground hover:bg-foreground/20 transition-colors"
                        >
                          {tag} ×
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                  >
                    {publishing ? 'Publishing...' : 'Publish Template'}
                  </Button>
                </>
              )}

              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

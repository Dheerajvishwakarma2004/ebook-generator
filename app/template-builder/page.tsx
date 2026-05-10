'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createTemplate } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import type { Template } from '@/lib/types'

const COVER_STYLES = ['classic', 'modern', 'bold', 'elegant', 'technical', 'creative'] as const
const FONTS = {
  heading: ['Georgia, serif', 'Playfair Display, serif', 'Merriweather, serif', 'Inter, sans-serif'],
  body: ['Georgia, serif', 'Inter, sans-serif', 'Merriweather, serif', 'Libre Baskerville, serif'],
}
const COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#0891B2', '#DC2626', '#6366F1',
]

export default function TemplateBuilderPage() {
  const router = useRouter()
  const { firebaseUser, loading: authLoading } = useAuth()
  const [step, setStep] = useState<'info' | 'design' | 'content'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Info step
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')

  // Design step
  const [coverStyle, setCoverStyle] = useState<'classic' | 'modern' | 'bold' | 'elegant' | 'technical' | 'creative'>('classic')
  const [headingFont, setHeadingFont] = useState(FONTS.heading[0])
  const [bodyFont, setBodyFont] = useState(FONTS.body[0])
  const [accentColor, setAccentColor] = useState(COLORS[0])

  // Content step
  const [title, setTitle] = useState('Sample Title')
  const [author, setAuthor] = useState('Your Name')
  const [subtitle, setSubtitle] = useState('Sample Subtitle')
  const [chapters, setChapters] = useState([
    { id: '1', title: 'Chapter 1', content: 'Lorem ipsum dolor sit amet...' },
    { id: '2', title: 'Chapter 2', content: 'Lorem ipsum dolor sit amet...' },
  ])

  // Authentication bypassed for testing
  // if (authLoading) {
  //   return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  // }

  // if (!firebaseUser) {
  //   router.push('/login')
  //   return null
  // }

  const handleCreateTemplate = async () => {
    if (!name.trim() || !description.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setError('')
    setLoading(true)

    try {
      const templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
        creatorId: firebaseUser?.uid || 'demo-user-' + Date.now(),
        name,
        description,
        category,
        coverStyle,
        fonts: {
          heading: headingFont,
          body: bodyFont,
        },
        accentColor,
        accentBg: `from-${accentColor} to-${accentColor}/80`,
        defaultContent: {
          title,
          author,
          subtitle,
          chapters,
        },
        isPublished: false,
        usageCount: 0,
        revenuePercentage: 30,
        tags: [category],
      }

      const templateId = await createTemplate(firebaseUser.uid, templateData)
      router.push(`/template/${templateId}/edit`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create template'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create Template</h1>
          <p className="mt-2 text-muted-foreground">
            Design a professional template and earn revenue when others use it
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 flex gap-4">
          {(['info', 'design', 'content'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <button
                onClick={() => setStep(s)}
                className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === s
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-foreground/10 text-foreground'
                }`}
              >
                {i + 1}
              </button>
              <span className="text-sm font-medium text-foreground capitalize">{s}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Info Step */}
        {step === 'info' && (
          <div className="space-y-6 rounded-xl border border-border bg-card p-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="e.g., Professional Novel Template"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Describe your template..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option>General</option>
                <option>Novel</option>
                <option>Academic</option>
                <option>Technical</option>
                <option>Business</option>
                <option>Poetry</option>
                <option>Children's</option>
              </select>
            </div>

            <Button
              onClick={() => setStep('design')}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue to Design
            </Button>
          </div>
        )}

        {/* Design Step */}
        {step === 'design' && (
          <div className="space-y-6 rounded-xl border border-border bg-card p-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Cover Style
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {COVER_STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setCoverStyle(style)}
                    className={`rounded-lg border-2 p-3 text-left transition-all capitalize ${
                      coverStyle === style
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-foreground/20'
                    }`}
                  >
                    <p className="font-semibold text-foreground">{style}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Heading Font
              </label>
              <select
                value={headingFont}
                onChange={(e) => setHeadingFont(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              >
                {FONTS.heading.map((font) => (
                  <option key={font} value={font}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Body Font
              </label>
              <select
                value={bodyFont}
                onChange={(e) => setBodyFont(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              >
                {FONTS.body.map((font) => (
                  <option key={font} value={font}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Accent Color
              </label>
              <div className="grid gap-3 grid-cols-8">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    style={{ backgroundColor: color }}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      accentColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('info')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('content')}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Content Step */}
        {step === 'content' && (
          <div className="space-y-6 rounded-xl border border-border bg-card p-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Sample Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Sample Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Sample Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep('design')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={loading}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

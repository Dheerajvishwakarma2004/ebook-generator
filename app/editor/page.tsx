'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { templates, type EBook } from '@/lib/templates'
import { saveUserDraft, getUserDraft } from '@/lib/firestore'
import EditorPanel from '@/components/editor-panel'
import PreviewPanel from '@/components/preview-panel'
import ActionBar from '@/components/action-bar'

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const { firebaseUser, loading: authLoading } = useAuth()

  const [ebook, setEbook] = useState<EBook | null>(null)
  const [previewHtml, setPreviewHtml] = useState('')
  const [isCompiling, setIsCompiling] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'compiling' | 'complete'>('idle')
  const [error, setError] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [isSavingDraft, setIsSavingDraft] = useState(false)

  // Check authentication
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push(`/login?redirect=/editor${templateId ? '&template=' + templateId : ''}`)
    }
  }, [firebaseUser, authLoading, router, templateId])

  useEffect(() => {
    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem('selected-template')
    if (stored) {
      try {
        const template = JSON.parse(stored)
        setEbook({
          ...template.defaultContent,
          templateId: template.id,
        })
        setTemplateName(template.name)
        sessionStorage.removeItem('selected-template')
        return
      } catch {
        // Fall through
      }
    }

    // Fallback: find template by URL param
    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setEbook({
          ...template.defaultContent,
          templateId: template.id,
        })
        setTemplateName(template.name)
        return
      }
    }

    // Default if nothing found
    setEbook({
      title: 'My eBook',
      author: 'Author Name',
      subtitle: '',
      templateId: 'classic-novel',
      chapters: [
        { id: '1', title: 'Chapter 1', content: 'Start writing here...' },
      ],
    })
    setTemplateName('Classic Novel')
  }, [templateId])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!firebaseUser || !ebook) return

    const interval = setInterval(async () => {
      setIsSavingDraft(true)
      try {
        await saveUserDraft(firebaseUser.uid, ebook)
      } catch (err) {
        console.error('Draft save error:', err)
      } finally {
        setIsSavingDraft(false)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [firebaseUser, ebook])

  const handleSaveAndCompile = useCallback(async () => {
    if (!ebook) return

    setError('')
    setStatus('saving')
    setIsCompiling(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const response = await fetch('/api/compile-ebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ebook),
      })

      if (!response.ok) {
        throw new Error('Compilation failed')
      }

      setStatus('compiling')
      await new Promise((resolve) => setTimeout(resolve, 400))

      const data = await response.json()
      setPreviewHtml(data.html)
      setStatus('complete')

      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setError(msg)
      setStatus('idle')
    } finally {
      setIsCompiling(false)
    }
  }, [ebook])

  const handleDownloadPdf = useCallback(() => {
    const iframe = document.querySelector<HTMLIFrameElement>('#ebook-preview-frame')
    if (!iframe?.contentWindow) return
    iframe.contentWindow.print()
  }, [])

  if (authLoading || !ebook) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    )
  }

  if (!firebaseUser) {
    return null // Redirecting in useEffect
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Templates
          </button>
          <div className="h-5 w-px bg-border" />
          <div>
            <p className="text-sm font-semibold text-foreground">{ebook.title || 'Untitled'}</p>
            <p className="text-[10px] text-muted-foreground">{templateName} template</p>
          </div>
        </div>
        
        {/* Draft save indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSavingDraft ? (
            <>
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              <span>Saving draft...</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Draft auto-saved</span>
            </>
          )}
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-6 py-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0 text-destructive" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-destructive">{error}</p>
          </div>
        </div>
      )}

      {/* Editor + Preview */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-1/2 flex-col overflow-hidden border-r border-border bg-background">
          <div className="flex-1 overflow-y-auto">
            <EditorPanel ebook={ebook} setEbook={setEbook} />
          </div>
        </div>
        <div className="w-1/2 overflow-hidden">
          <PreviewPanel previewHtml={previewHtml} isCompiling={isCompiling} />
        </div>
      </div>

      <ActionBar
        onSaveAndCompile={handleSaveAndCompile}
        onDownloadPdf={handleDownloadPdf}
        isCompiling={isCompiling}
        hasPreview={!!previewHtml}
        status={status}
      />
    </div>
  )
}

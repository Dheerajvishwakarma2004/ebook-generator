'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { EBookTemplate } from '@/lib/templates'
import TemplatePreview from './template-preview'

interface TemplateCardProps {
  template: EBookTemplate
  onSelect: (template: EBookTemplate) => void
  requiresAuth?: boolean
}

export default function TemplateCard({ template, onSelect, requiresAuth }: TemplateCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [popoverSide, setPopoverSide] = useState<'right' | 'left'>('right')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleMouseEnter = useCallback(() => {
    timerRef.current = setTimeout(() => {
      // decide which side the popover should appear on
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect()
        const spaceRight = window.innerWidth - rect.right
        setPopoverSide(spaceRight > 260 ? 'right' : 'left')
      }
      setShowPreview(true)
    }, 400)
    setHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    clearTimeout(timerRef.current)
    setHovered(false)
    setShowPreview(false)
  }, [])

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div className="relative">
      <button
        ref={cardRef}
        onClick={() => onSelect(template)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:border-foreground/20 hover:shadow-lg hover:shadow-black/20"
      >
        <div className={`relative flex h-52 items-center justify-center bg-gradient-to-br ${template.accentBg} p-6`}>
          <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/0" />
          {requiresAuth && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white/90 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                <path d="M10 17h4v-6h-4v6z" />
              </svg>
              <span className="text-xs font-semibold text-white/90">Sign in to use</span>
            </div>
          )}
          <div className="relative z-10 flex flex-col items-center gap-2 text-center">
            <CoverIcon style={template.coverStyle} />
            <span className="text-sm font-bold tracking-wide text-white/90">
              {template.defaultContent.title}
            </span>
            <span className="text-xs text-white/50">
              {template.defaultContent.author}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
            <span className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {template.category}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {template.description}
          </p>
          <div className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
            Use this template
            <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Hover preview popover */}
      {showPreview && (
        <div
          className={`pointer-events-none absolute top-0 z-50 animate-in fade-in-0 zoom-in-95 ${
            popoverSide === 'right' ? 'left-full ml-4' : 'right-full mr-4'
          }`}
          style={{ animationDuration: '150ms' }}
        >
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xl shadow-black/30">
            <TemplatePreview template={template} />
          </div>
        </div>
      )}
    </div>
  )
}

function CoverIcon({ style }: { style: string }) {
  switch (style) {
    case 'classic':
      return (
        <svg className="h-10 w-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'modern':
      return (
        <svg className="h-10 w-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      )
    case 'bold':
      return (
        <svg className="h-10 w-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )
    case 'elegant':
      return (
        <svg className="h-10 w-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      )
    case 'technical':
      return (
        <svg className="h-10 w-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      )
    case 'creative':
      return (
        <svg className="h-10 w-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      )
    default:
      return null
  }
}

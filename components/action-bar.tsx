'use client'

import { Button } from '@/components/ui/button'

interface ActionBarProps {
  onSaveAndCompile: () => void
  onDownloadPdf: () => void
  isCompiling: boolean
  hasPreview: boolean
  status: 'idle' | 'saving' | 'compiling' | 'complete'
}

export default function ActionBar({ onSaveAndCompile, onDownloadPdf, isCompiling, hasPreview, status }: ActionBarProps) {
  const getStatusIndicator = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span>Saving...</span>
          </div>
        )
      case 'compiling':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span>Compiling...</span>
          </div>
        )
      case 'complete':
        return (
          <div className="flex items-center gap-2 text-xs text-accent">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Compilation complete</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="border-t border-border bg-card">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="h-5 min-w-36">{getStatusIndicator()}</div>

        <div className="flex items-center gap-3">
          {hasPreview && (
            <Button
              onClick={onDownloadPdf}
              variant="outline"
              className="rounded-lg bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all"
            >
              <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </Button>
          )}
          <Button
            onClick={onSaveAndCompile}
            disabled={isCompiling}
            className="rounded-lg bg-accent px-5 py-2 text-xs font-semibold uppercase tracking-wide text-accent-foreground transition-all hover:bg-accent/90 disabled:opacity-50"
          >
            {isCompiling ? 'Compiling...' : 'Save & Compile'}
          </Button>
        </div>
      </div>
    </div>
  )
}

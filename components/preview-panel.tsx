'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface PreviewPanelProps {
  previewHtml: string
  isCompiling: boolean
}

export default function PreviewPanel({ previewHtml, isCompiling }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(900)

  const adjustHeight = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument?.body) return
    const h = iframe.contentDocument.body.scrollHeight
    if (h > 0) setIframeHeight(h + 48)
  }, [])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !previewHtml) return

    const onLoad = () => {
      adjustHeight()
      // observe for late-loading fonts etc
      const timer = setTimeout(adjustHeight, 500)
      return () => clearTimeout(timer)
    }
    iframe.addEventListener('load', onLoad)
    return () => iframe.removeEventListener('load', onLoad)
  }, [previewHtml, adjustHeight])

  return (
    <div className="relative flex h-full flex-col bg-[#4a4d50]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Preview
        </span>
        {previewHtml && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Up to date
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        {isCompiling && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4 rounded-xl bg-card p-8 shadow-2xl">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-accent" />
              </div>
              <p className="text-sm font-medium text-foreground">Compiling...</p>
              <p className="text-xs text-muted-foreground">Generating your eBook preview</p>
            </div>
          </div>
        )}

        {previewHtml ? (
          <div className="h-full overflow-y-auto py-6">
            <iframe
              ref={iframeRef}
              id="ebook-preview-frame"
              srcDoc={previewHtml}
              style={{ height: iframeHeight }}
              className="mx-auto block w-[6.5in] border-none"
              title="eBook Preview"
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-white/10 p-5">
                  <svg className="h-10 w-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-semibold text-white/70">Ready to compile</p>
              <p className="mt-2 text-xs text-white/40">
                Your typeset preview will appear here
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <div className="h-px w-8 bg-white/20" />
              <span>{'Click "Save & Compile" to generate'}</span>
              <div className="h-px w-8 bg-white/20" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


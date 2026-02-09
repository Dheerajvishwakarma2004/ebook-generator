'use client'

import { useMemo, useState, useEffect } from 'react'
import type { EBookTemplate } from '@/lib/templates'

function esc(t: string) {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildPageHtml(tpl: EBookTemplate, pageIndex: number): string {
  const s = {
    heading: tpl.fonts.heading,
    body: tpl.fonts.body,
    accent: tpl.accentColor,
  }
  const d = tpl.defaultContent
  const year = new Date().getFullYear()

  const coverMap: Record<string, string> = {
    classic: `
      <div class="pg cover"><div class="ci ci-classic">
        <div class="orn">&mdash;&mdash;&mdash;</div>
        <h1>${esc(d.title)}</h1>
        ${d.subtitle ? `<p class="sub">${esc(d.subtitle)}</p>` : ''}
        <div class="auth">${esc(d.author)}</div>
      </div></div>`,
    modern: `
      <div class="pg cover"><div class="ci ci-modern">
        <span class="bar"></span>
        <h1>${esc(d.title)}</h1>
        ${d.subtitle ? `<p class="sub">${esc(d.subtitle)}</p>` : ''}
        <p class="auth">${esc(d.author)}</p>
      </div></div>`,
    bold: `
      <div class="pg cover"><div class="ci ci-bold">
        <h1>${esc(d.title)}</h1>
        ${d.subtitle ? `<p class="sub">${esc(d.subtitle)}</p>` : ''}
        <div class="bdiv"></div>
        <p class="auth">${esc(d.author)}</p>
      </div></div>`,
    elegant: `
      <div class="pg cover"><div class="ci ci-elegant">
        <div class="eborder">
          <h1>${esc(d.title)}</h1>
          ${d.subtitle ? `<p class="sub">${esc(d.subtitle)}</p>` : ''}
          <p class="auth">${esc(d.author)}</p>
        </div>
      </div></div>`,
    technical: `
      <div class="pg cover"><div class="ci ci-technical">
        <div class="tlabel">TECHNICAL REFERENCE</div>
        <h1>${esc(d.title)}</h1>
        ${d.subtitle ? `<p class="sub">${esc(d.subtitle)}</p>` : ''}
        <p class="auth">${esc(d.author)}</p>
        <div class="tver">${year}</div>
      </div></div>`,
    creative: `
      <div class="pg cover"><div class="ci ci-creative">
        <h1>${esc(d.title)}</h1>
        ${d.subtitle ? `<p class="sub">${esc(d.subtitle)}</p>` : ''}
        <div class="swoosh"></div>
        <p class="auth">${esc(d.author)}</p>
      </div></div>`,
  }

  let pageContent = ''

  if (pageIndex === 0) {
    // Cover page
    pageContent = coverMap[tpl.coverStyle] || coverMap.classic
  } else if (pageIndex === 1) {
    // TOC page
    const tocItems = d.chapters
      .map(
        (ch, i) =>
          `<li><span class="tn">${String(i + 1).padStart(2, '0')}</span><span class="td"></span><span class="tl">${esc(ch.title)}</span></li>`
      )
      .join('')
    pageContent = `
      <div class="pg toc">
        <h2 class="th">Contents</h2>
        <ol class="tlist">${tocItems}</ol>
      </div>`
  } else if (pageIndex === 2) {
    // First chapter page
    const firstCh = d.chapters[0]
    if (firstCh) {
      pageContent = `<div class="pg chp">
        <div class="cho">
          <span class="chn">01</span>
          <h2 class="cht">${esc(firstCh.title)}</h2>
          <div class="chr"></div>
        </div>
        <div class="chb"><p>${esc(firstCh.content.slice(0, 280))}...</p></div>
      </div>`
    }
  }

  return `<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:5.5pt}
body{font-family:${s.body};color:#1a1a1a;background:#e0e0e0;line-height:1.65;-webkit-font-smoothing:antialiased;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:0}
.pg{width:3in;height:4.5in;background:#fff;margin:0;padding:0.42in 0.38in 0.35in;box-shadow:0 1px 6px rgba(0,0,0,.12);position:relative;overflow:hidden}

/* Cover shared */
.cover{padding:0}
.ci{width:100%;height:4.5in;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0.5in 0.38in}
.ci h1{font-family:${s.heading};font-size:1.1rem;font-weight:700;line-height:1.2;color:#0a0a0a;margin-bottom:0.2rem;letter-spacing:-0.02em}
.ci .sub{font-size:0.55rem;color:#555;font-style:italic;margin-bottom:0.7rem}
.ci .auth{font-size:0.5rem;font-weight:600;color:#333;letter-spacing:0.04em}

/* Classic */
.ci-classic .orn{color:${s.accent};font-size:0.6rem;letter-spacing:0.5em;margin-bottom:1rem}
/* Modern */
.ci-modern{justify-content:flex-end;align-items:flex-start;text-align:left}
.ci-modern h1{font-size:1.2rem}
.bar{width:24px;height:2px;background:${s.accent};border-radius:1px;margin-bottom:0.6rem;display:block}
/* Bold */
.ci-bold{background:${s.accent}}
.ci-bold h1{color:#fff;font-size:1.3rem}
.ci-bold .sub{color:rgba(255,255,255,.7)}
.ci-bold .auth{color:rgba(255,255,255,.85)}
.bdiv{width:30px;height:1px;background:rgba(255,255,255,.35);margin:0.5rem auto 0.6rem}
/* Elegant */
.eborder{border:1.5px solid ${s.accent};padding:1.2rem 1rem}
/* Technical */
.ci-technical{align-items:flex-start;text-align:left;justify-content:flex-start;padding-top:1in}
.tlabel{font-size:0.35rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${s.accent};margin-bottom:0.5rem;border:1px solid ${s.accent};padding:0.1rem 0.3rem;display:inline-block}
.ci-technical h1{font-size:1rem;margin-bottom:0.15rem}
.tver{position:absolute;bottom:0.5in;left:0.38in;font-size:0.4rem;color:#999;font-family:monospace}
/* Creative */
.swoosh{width:40px;height:2px;background:linear-gradient(90deg,${s.accent},transparent);margin:0.6rem auto;border-radius:1px}

/* TOC */
.toc{padding-top:0.7in}
.th{font-family:${s.heading};font-size:0.75rem;font-weight:700;margin-bottom:0.7rem;color:#0a0a0a}
.tlist{list-style:none}
.tlist li{display:flex;align-items:baseline;gap:0.25rem;padding:0.25rem 0;border-bottom:1px solid #f0f0f0;font-size:0.5rem}
.tn{font-weight:700;color:${s.accent};font-size:0.45rem;min-width:0.8rem}
.td{flex:1;border-bottom:1px dotted #ccc;margin-bottom:0.12rem}
.tl{color:#333}

/* Chapter */
.chp{padding-top:0.6in}
.cho{margin-bottom:0.8rem}
.chn{display:block;font-size:0.35rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:${s.accent};margin-bottom:0.15rem}
.cht{font-family:${s.heading};font-size:0.8rem;font-weight:700;color:#0a0a0a;line-height:1.25}
.chr{width:1.2rem;height:1.5px;background:${s.accent};margin-top:0.4rem;border-radius:1px}
.chb p{font-size:0.5rem;margin-bottom:0.4rem;text-align:justify;color:#333;line-height:1.6}
</style></head><body>
${pageContent}
</body></html>`
}

interface TemplatePreviewProps {
  template: EBookTemplate
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 3

  const html = useMemo(() => buildPageHtml(template, currentPage), [template, currentPage])

  // Auto-play carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((p) => (p + 1) % totalPages)
    }, 3000)
    return () => clearInterval(interval)
  }, [totalPages])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPage((p) => Math.max(0, p - 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1))
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))

  const pageLabels = ['Cover', 'Contents', 'Chapter 1']

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-foreground">{template.name}</div>
        <div className="text-[10px] text-muted-foreground">
          {currentPage + 1} / {totalPages}
        </div>
      </div>

      <div className="relative overflow-hidden rounded border border-border bg-[#e0e0e0]">
        <iframe
          srcDoc={html}
          className="pointer-events-none mx-auto block h-[300px] w-[200px]"
          title={`${template.name} page ${currentPage + 1}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{pageLabels[currentPage]}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="rounded bg-foreground/10 p-1 transition-colors disabled:opacity-30 hover:bg-foreground/20"
            title="Previous page (←)"
          >
            <svg className="h-3 w-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="rounded bg-foreground/10 p-1 transition-colors disabled:opacity-30 hover:bg-foreground/20"
            title="Next page (→)"
          >
            <svg className="h-3 w-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}


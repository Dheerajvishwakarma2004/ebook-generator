import { NextRequest, NextResponse } from "next/server";
import { templates } from "@/lib/templates";

interface CompileRequest {
  title: string;
  author: string;
  subtitle?: string;
  templateId?: string;
  chapters: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2p(text: string): string {
  return text
    .split("\n\n")
    .map((block) => {
      const t = block.trim();
      if (!t) return "";
      return `<p>${esc(t).replace(/\n/g, "<br/>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

/* ================================================================
   Each template has a distinct cover page + chapter styling.
   Standard trade-book trim size: 6 in x 9 in.
   ================================================================ */

function getStyle(templateId?: string) {
  const tpl = templates.find((t) => t.id === templateId);
  return {
    heading: tpl?.fonts.heading ?? "Georgia, serif",
    body: tpl?.fonts.body ?? "Georgia, serif",
    accent: tpl?.accentColor ?? "#2563EB",
    style: tpl?.coverStyle ?? "classic",
  };
}

function buildHtml(data: CompileRequest): string {
  const s = getStyle(data.templateId);
  const year = new Date().getFullYear();

  /* ---------- cover page per template style ---------- */
  const coverMap: Record<string, string> = {
    classic: `
      <div class="page cover">
        <div class="cover-inner cover-classic">
          <div class="ornament">&mdash;&mdash;&mdash;</div>
          <h1>${esc(data.title)}</h1>
          ${data.subtitle ? `<p class="subtitle">${esc(data.subtitle)}</p>` : ""}
          <div class="author-line">${esc(data.author)}</div>
        </div>
      </div>`,
    modern: `
      <div class="page cover">
        <div class="cover-inner cover-modern">
          <span class="cover-accent-bar"></span>
          <h1>${esc(data.title)}</h1>
          ${data.subtitle ? `<p class="subtitle">${esc(data.subtitle)}</p>` : ""}
          <p class="author-line">${esc(data.author)}</p>
        </div>
      </div>`,
    bold: `
      <div class="page cover">
        <div class="cover-inner cover-bold">
          <h1>${esc(data.title)}</h1>
          ${data.subtitle ? `<p class="subtitle">${esc(data.subtitle)}</p>` : ""}
          <div class="bold-divider"></div>
          <p class="author-line">${esc(data.author)}</p>
        </div>
      </div>`,
    elegant: `
      <div class="page cover">
        <div class="cover-inner cover-elegant">
          <div class="elegant-border">
            <h1>${esc(data.title)}</h1>
            ${data.subtitle ? `<p class="subtitle">${esc(data.subtitle)}</p>` : ""}
            <p class="author-line">${esc(data.author)}</p>
          </div>
        </div>
      </div>`,
    technical: `
      <div class="page cover">
        <div class="cover-inner cover-technical">
          <div class="tech-label">TECHNICAL REFERENCE</div>
          <h1>${esc(data.title)}</h1>
          ${data.subtitle ? `<p class="subtitle">${esc(data.subtitle)}</p>` : ""}
          <p class="author-line">${esc(data.author)}</p>
          <div class="tech-version">${year}</div>
        </div>
      </div>`,
    creative: `
      <div class="page cover">
        <div class="cover-inner cover-creative">
          <h1>${esc(data.title)}</h1>
          ${data.subtitle ? `<p class="subtitle">${esc(data.subtitle)}</p>` : ""}
          <div class="creative-swoosh"></div>
          <p class="author-line">${esc(data.author)}</p>
        </div>
      </div>`,
  };

  const cover = coverMap[s.style] || coverMap.classic;

  /* ---------- copyright page ---------- */
  const copyright = `
    <div class="page copyright-page">
      <div class="copyright-content">
        <p class="cp-title">${esc(data.title)}</p>
        ${data.subtitle ? `<p class="cp-sub">${esc(data.subtitle)}</p>` : ""}
        <br/>
        <p>Copyright &copy; ${year} ${esc(data.author)}</p>
        <p>All rights reserved.</p>
        <br/>
        <p>No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author.</p>
        <br/>
        <p>First Edition: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>
    </div>`;

  /* ---------- table of contents ---------- */
  const tocItems = data.chapters
    .map(
      (ch, i) =>
        `<li>
          <span class="toc-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="toc-dot"></span>
          <span class="toc-label">${esc(ch.title)}</span>
        </li>`
    )
    .join("\n");

  const toc = `
    <div class="page toc-page">
      <h2 class="toc-heading">Contents</h2>
      <ol class="toc-list">${tocItems}</ol>
    </div>`;

  /* ---------- chapter pages ---------- */
  const chapters = data.chapters
    .map(
      (ch, i) => `
    <div class="page chapter-page">
      <div class="chapter-opener">
        <span class="ch-number">${String(i + 1).padStart(2, "0")}</span>
        <h2 class="ch-title">${esc(ch.title)}</h2>
        <div class="ch-rule"></div>
      </div>
      <div class="chapter-body">${nl2p(ch.content)}</div>
      <div class="page-footer">${esc(data.title)} &mdash; ${i + 1}</div>
    </div>`
    )
    .join("\n");

  /* ---------- full HTML ---------- */
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:wght@400;600&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/>
<style>
/* ===== RESET & BASE ===== */
*{margin:0;padding:0;box-sizing:border-box}
html{font-size:11pt}
body{
  font-family:${s.body};
  color:#1a1a1a;
  background:#e8e8e8;
  line-height:1.75;
  -webkit-font-smoothing:antialiased;
}

/* ===== PAGE (6 x 9 in trade-book) ===== */
.page{
  width:6in;
  min-height:9in;
  margin:24px auto;
  background:#fff;
  padding:0.85in 0.75in 0.7in;
  box-shadow:0 2px 16px rgba(0,0,0,.12);
  position:relative;
  overflow:hidden;
}

@media print{
  @page{
    size:6in 9in;
    margin:0;
  }
  html,body{
    background:#fff;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
  }
  .page{
    width:6in;height:9in;
    margin:0;padding:0.85in 0.75in 0.7in;
    box-shadow:none;
    page-break-after:always;
    page-break-inside:avoid;
    overflow:hidden;
  }
  .page:last-child{page-break-after:auto}
  .page-footer{display:none}
}

/* ===== COVER PAGE - shared ===== */
.cover{padding:0}
.cover-inner{
  width:100%;height:9in;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  text-align:center;
  padding:1in 0.75in;
}
.cover h1{
  font-family:${s.heading};
  font-size:2rem;font-weight:700;
  line-height:1.2;letter-spacing:-0.02em;
  color:#0a0a0a;margin-bottom:0.4rem;
}
.cover .subtitle{
  font-size:0.95rem;color:#555;
  font-style:italic;margin-bottom:1.5rem;
}
.cover .author-line{
  font-size:0.9rem;font-weight:600;
  color:#333;letter-spacing:0.04em;
}

/* -- classic -- */
.cover-classic .ornament{
  color:${s.accent};font-size:1.2rem;
  letter-spacing:0.5em;margin-bottom:2rem;
}
/* -- modern -- */
.cover-modern{justify-content:flex-end;align-items:flex-start;text-align:left}
.cover-modern h1{font-size:2.2rem}
.cover-accent-bar{
  width:48px;height:4px;background:${s.accent};
  border-radius:2px;margin-bottom:1.2rem;
}
/* -- bold -- */
.cover-bold{background:${s.accent}}
.cover-bold h1{color:#fff;font-size:2.4rem}
.cover-bold .subtitle{color:rgba(255,255,255,.75)}
.cover-bold .author-line{color:rgba(255,255,255,.9)}
.cover-bold .bold-divider{
  width:60px;height:2px;background:rgba(255,255,255,.4);
  margin:1rem auto 1.2rem;
}
/* -- elegant -- */
.cover-elegant .elegant-border{
  border:2px solid ${s.accent};
  padding:2.5rem 2rem;
}
/* -- technical -- */
.cover-technical{align-items:flex-start;text-align:left;justify-content:flex-start;padding-top:2in}
.cover-technical .tech-label{
  font-size:0.6rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.2em;
  color:${s.accent};margin-bottom:1rem;
  border:1px solid ${s.accent};padding:0.2rem 0.6rem;
  display:inline-block;
}
.cover-technical h1{font-size:1.8rem;margin-bottom:0.3rem}
.cover-technical .tech-version{
  position:absolute;bottom:1in;left:0.75in;
  font-size:0.75rem;color:#999;font-family:monospace;
}
/* -- creative -- */
.cover-creative .creative-swoosh{
  width:80px;height:3px;
  background:linear-gradient(90deg,${s.accent},transparent);
  margin:1.2rem auto;border-radius:2px;
}

/* ===== COPYRIGHT ===== */
.copyright-page{display:flex;align-items:flex-end}
.copyright-content{font-size:0.75rem;color:#777;line-height:1.7}
.copyright-content p{margin-bottom:0.15rem}
.cp-title{font-weight:700;color:#333;font-size:0.8rem}
.cp-sub{font-style:italic;color:#555}

/* ===== TABLE OF CONTENTS ===== */
.toc-page{padding-top:1.4in}
.toc-heading{
  font-family:${s.heading};
  font-size:1.3rem;font-weight:700;
  margin-bottom:1.5rem;color:#0a0a0a;
  letter-spacing:-0.01em;
}
.toc-list{list-style:none;counter-reset:toc}
.toc-list li{
  display:flex;align-items:baseline;
  gap:0.5rem;padding:0.5rem 0;
  border-bottom:1px solid #f0f0f0;
  font-size:0.9rem;
}
.toc-num{
  font-weight:700;color:${s.accent};
  font-size:0.8rem;min-width:1.6rem;
  font-variant-numeric:tabular-nums;
}
.toc-dot{
  flex:1;border-bottom:1px dotted #ccc;
  margin-bottom:0.25rem;
}
.toc-label{color:#333}

/* ===== CHAPTER PAGES ===== */
.chapter-page{padding-top:1.2in}
.chapter-opener{margin-bottom:1.8rem}
.ch-number{
  display:block;
  font-size:0.65rem;font-weight:700;
  text-transform:uppercase;letter-spacing:0.2em;
  color:${s.accent};margin-bottom:0.3rem;
}
.ch-title{
  font-family:${s.heading};
  font-size:1.5rem;font-weight:700;
  color:#0a0a0a;line-height:1.25;
  letter-spacing:-0.01em;
}
.ch-rule{
  width:2.5rem;height:2.5px;
  background:${s.accent};margin-top:0.8rem;
  border-radius:1px;
}
.chapter-body p{
  margin-bottom:0.85rem;
  text-align:justify;
  hyphens:auto;
}
.page-footer{
  position:absolute;bottom:0.5in;left:0.75in;right:0.75in;
  text-align:center;
  font-size:0.65rem;color:#bbb;
  border-top:1px solid #eee;
  padding-top:0.4rem;
}
</style>
</head>
<body>
${cover}
${copyright}
${toc}
${chapters}
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: CompileRequest = await request.json();
    const html = buildHtml(body);
    return NextResponse.json({ html }, { status: 200 });
  } catch (error) {
    console.error("Compilation error:", error);
    return NextResponse.json({ error: "Compilation failed" }, { status: 500 });
  }
}



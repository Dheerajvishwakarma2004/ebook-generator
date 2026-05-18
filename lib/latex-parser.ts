/**
 * LaTeX Parser - Converts raw LaTeX code into template structure
 * Extracts title, author, chapters from common LaTeX document structures
 */

export interface ParsedLaTeXContent {
  title: string
  author: string
  subtitle: string
  chapters: Array<{
    id: string
    title: string
    content: string
  }>
  latex: string // Store original LaTeX for reference
}

/**
 * Parse LaTeX code and extract document structure
 */
export function parseLatexDocument(latexCode: string): ParsedLaTeXContent {
  const normalizedCode = latexCode.trim()
  
  // Extract title from \title{...}
  const titleMatch = normalizedCode.match(/\\title\s*\{([^}]+)\}/)
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Document'
  
  // Extract author from \author{...}
  const authorMatch = normalizedCode.match(/\\author\s*\{([^}]+)\}/)
  const author = authorMatch ? authorMatch[1].trim() : 'Unknown Author'
  
  // Extract subtitle - try common patterns
  const subtitleMatch = normalizedCode.match(/\\subtitle\s*\{([^}]+)\}/) || 
                       normalizedCode.match(/\\usepackage\[subtitle=([^}]+)\]/)
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : 'A LaTeX Document'
  
  // Extract chapters
  const chapters = extractChapters(normalizedCode)
  
  return {
    title,
    author,
    subtitle,
    chapters: chapters.length > 0 ? chapters : getDefaultChapters(),
    latex: normalizedCode,
  }
}

/**
 * Extract chapters from LaTeX document
 */
function extractChapters(latexCode: string): Array<{
  id: string
  title: string
  content: string
}> {
  const chapters: Array<{
    id: string
    title: string
    content: string
  }> = []
  
  // Look for \chapter{...} or \section{...} commands
  const chapterPattern = /\\chapter\s*\{([^}]+)\}([\s\S]*?)(?=\\chapter|\\end\{document\}|$)/gi
  const sectionPattern = /\\section\s*\{([^}]+)\}([\s\S]*?)(?=\\section|\\chapter|\\end\{document\}|$)/gi
  
  let match
  let chapterId = 1
  
  // Try to find chapters first
  const chapterRegex = new RegExp(chapterPattern.source, chapterPattern.flags)
  while ((match = chapterRegex.exec(latexCode)) !== null) {
    const title = cleanLaTeXText(match[1])
    const content = extractAndCleanContent(match[2])
    
    if (content.length > 0 || title.length > 0) {
      chapters.push({
        id: String(chapterId),
        title: title || `Chapter ${chapterId}`,
        content: content,
      })
      chapterId++
    }
  }
  
  // If no chapters found, try sections
  if (chapters.length === 0) {
    const sectionRegex = new RegExp(sectionPattern.source, sectionPattern.flags)
    while ((match = sectionRegex.exec(latexCode)) !== null) {
      const title = cleanLaTeXText(match[1])
      const content = extractAndCleanContent(match[2])
      
      if (content.length > 0 || title.length > 0) {
        chapters.push({
          id: String(chapterId),
          title: title || `Section ${chapterId}`,
          content: content,
        })
        chapterId++
      }
    }
  }
  
  return chapters
}

/**
 * Extract and clean content from LaTeX sections
 */
function extractAndCleanContent(text: string): string {
  // Remove common LaTeX commands and environments
  let content = text
    // Remove \textbf{...}, \textit{...}, \texttt{...}, etc.
    .replace(/\\text\w+\s*\{([^}]+)\}/g, '$1')
    // Remove \emph{...}, \bf{...}, etc.
    .replace(/\\(emph|bf|it|tt|rm|sf)\s*\{([^}]+)\}/g, '$2')
    // Remove citations \cite{...}
    .replace(/\\cite\s*\{[^}]+\}/g, '[citation]')
    // Remove references \ref{...}
    .replace(/\\ref\s*\{[^}]+\}/g, '[ref]')
    // Remove labels \label{...}
    .replace(/\\label\s*\{[^}]+\}/g, '')
    // Remove newline commands
    .replace(/\\\\/g, '\n')
    // Remove paragraph markers
    .replace(/\\par\b/g, '\n')
    // Remove extra whitespace but preserve paragraph breaks
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n')
    .trim()
  
  return content
}

/**
 * Clean LaTeX formatting from text
 */
function cleanLaTeXText(text: string): string {
  return text
    .replace(/\\textbf\s*\{([^}]+)\}/g, '$1')
    .replace(/\\textit\s*\{([^}]+)\}/g, '$1')
    .replace(/\\emph\s*\{([^}]+)\}/g, '$1')
    .replace(/[{}]/g, '')
    .trim()
}

/**
 * Default chapters if none found in LaTeX
 */
function getDefaultChapters(): Array<{
  id: string
  title: string
  content: string
}> {
  return [
    {
      id: '1',
      title: 'Chapter One',
      content: 'Your LaTeX document content will appear here. Make sure your LaTeX includes proper chapter or section divisions using \\chapter{} or \\section{} commands.',
    },
    {
      id: '2',
      title: 'Chapter Two',
      content: 'If chapters are not found, add them to your LaTeX using standard LaTeX commands.',
    },
  ]
}

/**
 * Validate LaTeX code
 */
export function validateLatex(latexCode: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (!latexCode || latexCode.trim().length === 0) {
    errors.push('LaTeX code cannot be empty')
    return { isValid: false, errors }
  }
  
  // Check for basic document structure
  if (!latexCode.includes('\\documentclass') && !latexCode.includes('\\chapter') && !latexCode.includes('\\section')) {
    errors.push('LaTeX code should contain document structure (\\documentclass, \\chapter, or \\section)')
  }
  
  // Check for unmatched braces (simple check)
  const openBraces = (latexCode.match(/\{/g) || []).length
  const closeBraces = (latexCode.match(/\}/g) || []).length
  if (openBraces !== closeBraces) {
    errors.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Generate preview text from LaTeX code
 */
export function generateLatexPreview(latexCode: string): string {
  const parsed = parseLatexDocument(latexCode)
  const preview = `
Title: ${parsed.title}
Author: ${parsed.author}
Subtitle: ${parsed.subtitle}

Chapters: ${parsed.chapters.length}
${parsed.chapters.map(ch => `- ${ch.title}`).join('\n')}
  `.trim()
  
  return preview
}

'use client'

import type { EBook } from '@/lib/templates'
import { Button } from '@/components/ui/button'
import ChapterCard from './chapter-card'

interface EditorPanelProps {
  ebook: EBook
  setEbook: (ebook: EBook) => void
}

export default function EditorPanel({ ebook, setEbook }: EditorPanelProps) {
  const handleTitleChange = (value: string) => {
    setEbook({ ...ebook, title: value })
  }

  const handleAuthorChange = (value: string) => {
    setEbook({ ...ebook, author: value })
  }

  const handleSubtitleChange = (value: string) => {
    setEbook({ ...ebook, subtitle: value })
  }

  const handleChapterTitleChange = (id: string, title: string) => {
    setEbook({
      ...ebook,
      chapters: ebook.chapters.map((ch) => (ch.id === id ? { ...ch, title } : ch)),
    })
  }

  const handleChapterContentChange = (id: string, content: string) => {
    setEbook({
      ...ebook,
      chapters: ebook.chapters.map((ch) => (ch.id === id ? { ...ch, content } : ch)),
    })
  }

  const handleAddChapter = () => {
    const newChapterId = Date.now().toString()
    setEbook({
      ...ebook,
      chapters: [
        ...ebook.chapters,
        {
          id: newChapterId,
          title: `Chapter ${ebook.chapters.length + 1}`,
          content: '',
        },
      ],
    })
  }

  const handleRemoveChapter = (id: string) => {
    if (ebook.chapters.length === 1) {
      return
    }
    setEbook({
      ...ebook,
      chapters: ebook.chapters.filter((ch) => ch.id !== id),
    })
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <div className="mb-6 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Metadata
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Book Title
            </label>
            <input
              type="text"
              value={ebook.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter book title"
              className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Author Name
            </label>
            <input
              type="text"
              value={ebook.author}
              onChange={(e) => handleAuthorChange(e.target.value)}
              placeholder="Enter author name"
              className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subtitle <span className="text-xs font-normal text-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={ebook.subtitle || ''}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              placeholder="Enter subtitle"
              className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground placeholder-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Chapters
            </h2>
          </div>
          <Button
            onClick={handleAddChapter}
            className="rounded-lg bg-accent text-xs font-semibold uppercase tracking-wide text-accent-foreground hover:bg-accent/90"
            size="sm"
          >
            + Add Chapter
          </Button>
        </div>

        <div className="space-y-3">
          {ebook.chapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onTitleChange={(title) => handleChapterTitleChange(chapter.id, title)}
              onContentChange={(content) => handleChapterContentChange(chapter.id, content)}
              onRemove={() => handleRemoveChapter(chapter.id)}
              canRemove={ebook.chapters.length > 1}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

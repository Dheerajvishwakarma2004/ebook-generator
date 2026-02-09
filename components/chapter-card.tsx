'use client'

import { Button } from '@/components/ui/button'

interface ChapterCardProps {
  chapter: {
    id: string
    title: string
    content: string
  }
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onRemove: () => void
  canRemove: boolean
}

export default function ChapterCard({
  chapter,
  onTitleChange,
  onContentChange,
  onRemove,
  canRemove,
}: ChapterCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/50">
      <div className="mb-4 flex items-center justify-between">
        <input
          type="text"
          value={chapter.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Chapter title"
          className="flex-1 bg-transparent text-base font-semibold text-foreground placeholder-muted-foreground focus:outline-none"
        />
        {canRemove && (
          <button
            onClick={onRemove}
            className="ml-3 opacity-0 transition-opacity group-hover:opacity-100"
            title="Remove chapter"
          >
            <svg
              className="h-5 w-5 text-muted-foreground hover:text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <textarea
        value={chapter.content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Write your chapter content here..."
        className="h-56 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder-muted-foreground focus:outline-none"
      />
    </div>
  )
}


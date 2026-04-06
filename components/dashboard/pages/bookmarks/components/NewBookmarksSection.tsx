'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { BookmarkIcon } from './BookmarkIcon'
import { useThemeColor } from '@/hooks/useThemeColor'

interface Bookmark {
  id: number
  name: string
  url: string
  icon?: string | null
  is_new?: boolean
}

interface NewBookmarksSectionProps {
  bookmarks: Bookmark[]
  selectedBookmarks: number[]
  onToggleSelection: (id: number) => void
  onBookmarkClick: (bookmark: Bookmark) => void
}

export const NewBookmarksSection = ({ 
  bookmarks, 
  selectedBookmarks, 
  onToggleSelection, 
  onBookmarkClick 
}: NewBookmarksSectionProps) => {
  const themeColor = useThemeColor()
  
  if (bookmarks.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg">
      <div className="p-4 border-b dark:border-gray-800" style={{ borderColor: themeColor.light }}>
        <h3 className="text-sm uppercase tracking-wide" style={{ color: themeColor.text }}>
          NEW BOOKMARKS
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-2 p-4">
        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            className="flex items-center gap-3 group"
          >
            <Checkbox 
              checked={selectedBookmarks.includes(bookmark.id)}
              onCheckedChange={() => onToggleSelection(bookmark.id)}
              className="data-[state=checked]:bg-[var(--theme-base)]"
              style={{
                borderColor: themeColor.light,
                ['--theme-base' as any]: themeColor.base
              }}
            />
            <div 
              className="flex-shrink-0 w-7 h-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center"
            >
              <BookmarkIcon icon={bookmark.icon} className="h-4 w-4" />
            </div>
            <button
              onClick={() => onBookmarkClick(bookmark)}
              className="text-sm text-gray-700 dark:text-gray-300 truncate text-left transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = themeColor.text}
              onMouseLeave={(e) => e.currentTarget.style.color = ''}
            >
              {bookmark.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { BookmarkIcon } from './BookmarkIcon'

interface Bookmark {
  id: number
  name: string
  url: string
  icon?: string | null
  is_new?: boolean
  is_favorite?: boolean
}

interface FolderCardProps {
  name: string
  color?: string | null
  bookmarks?: Bookmark[]
  onBookmarkClick: (bookmark: Bookmark) => void
  isHighlighted?: boolean
}

export const FolderCard = ({ name, color, bookmarks, onBookmarkClick, isHighlighted }: FolderCardProps) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm transition-all ${isHighlighted ? 'ring-2 ring-offset-2' : ''}`}
      style={isHighlighted ? { '--ring-color': color || '#3b82f6' } as React.CSSProperties : undefined}
    >
      <div 
        className="p-4 border-b border-gray-100 dark:border-gray-800"
        style={{ 
          borderBottomColor: color || '#3b82f6',
          color: color || '#3b82f6'
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          {name}
        </h3>
      </div>
      <div className="p-2">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map(bookmark => (
            <button
              key={bookmark.id}
              onClick={() => onBookmarkClick(bookmark)}
              className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors text-left"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                <BookmarkIcon icon={bookmark.icon} className="h-4 w-4" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {bookmark.name}
              </span>
            </button>
          ))
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 px-2 py-2">
            No bookmarks
          </p>
        )}
      </div>
    </div>
  )
}

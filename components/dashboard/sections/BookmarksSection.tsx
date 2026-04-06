'use client'

import { useEffect, useState } from 'react'
import { useBookmarkStore } from '@/stores/useBookmarkStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, FolderPlus, Link, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { AddFolderDialog } from './AddFolderDialog'
import { AddBookmarkDialog } from './AddBookmarkDialog'
import Image from 'next/image'
import { useThemeColor } from '@/hooks/useThemeColor'

// Helper to render bookmark icon
const BookmarkIcon = ({ icon, className = "h-4 w-4" }: { icon?: string | null, className?: string }) => {
  if (icon) {
    // Check if icon is a URL (for image icons)
    if (icon.startsWith('http') || icon.startsWith('/')) {
      return <Image src={icon} alt="" width={16} height={16} className={className} />
    }
    // Otherwise treat as emoji or text icon
    return <span className="text-sm">{icon}</span>
  }
  // Default link icon
  return <Link className={`${className} text-gray-500 dark:text-gray-400`} />
}

export function BookmarksSection() {
  const themeColor = useThemeColor()
  const { 
    folders, 
    searchQuery,
    isLoading,
    fetchFolders,
    setSearchQuery,
    markAsRead,
    toggleFavorite
  } = useBookmarkStore()

  const [showFolderDialog, setShowFolderDialog] = useState(false)
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false)
  const [selectedNewBookmarks, setSelectedNewBookmarks] = useState<number[]>([])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const filteredFolders = folders.filter(folder => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const folderMatch = folder.name.toLowerCase().includes(query)
    const bookmarkMatch = folder.bookmarks?.some(b => 
      b.name.toLowerCase().includes(query) || b.url.toLowerCase().includes(query)
    )
    return folderMatch || bookmarkMatch
  })

  const newBookmarks = folders.flatMap(f => f.bookmarks || []).filter(b => b.is_new)
  const favoriteBookmarks = folders.flatMap(f => f.bookmarks || []).filter(b => b.is_favorite)

  const handleBookmarkClick = async (bookmark: any) => {
    if (bookmark.is_new) {
      await markAsRead(bookmark.id)
    }
    window.open(bookmark.url, '_blank')
  }

  const toggleNewBookmarkSelection = (id: number) => {
    setSelectedNewBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  if (isLoading && folders.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search all bookmarks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-transparent border hover:text-gray-100 uppercase"
            style={{ 
              borderColor: themeColor.base,
              color: themeColor.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = themeColor.dark
              e.currentTarget.style.backgroundColor = themeColor.dark
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = themeColor.base
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = themeColor.text
            }}
            onClick={() => setShowFolderDialog(true)}
          >
            <FolderPlus className="h-4 w-4" />
            Add Folder
          </Button>
          <Button 
            size="sm" 
            className="bg-transparent border hover:text-gray-100 uppercase"
            style={{ 
              borderColor: themeColor.base,
              color: themeColor.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = themeColor.dark
              e.currentTarget.style.backgroundColor = themeColor.dark
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = themeColor.base
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = themeColor.text
            }}
            onClick={() => setShowBookmarkDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Add Quick Link
          </Button>
        </div>
      </div>

      {/* New Bookmarks Section */}
      {newBookmarks.length > 0 && !searchQuery && (
        <div className="bg-white dark:bg-gray-900 rounded-lg">
          <div className="p-4 border-b dark:border-gray-800" style={{ borderColor: themeColor.light }}>
            <h3 className="text-sm uppercase tracking-wide" style={{ color: themeColor.text }}>
              NEW BOOKMARKS
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-2 p-4">
            {newBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="flex items-center gap-3 group"
              >
                <Checkbox 
                  checked={selectedNewBookmarks.includes(bookmark.id)}
                  onCheckedChange={() => toggleNewBookmarkSelection(bookmark.id)}
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
                  onClick={() => handleBookmarkClick(bookmark)}
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
      )}

      {/* Folders Section - Show only first row (4 folders max) */}
      <div className="flex flex-wrap gap-4">
        {/* Your Favorites Column */}
        {favoriteBookmarks.length > 0 && !searchQuery && (
          <div className="min-w-[180px] flex-1 max-w-[250px]">
            <div 
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm"
            >
              <div className="px-4 py-3 border-b dark:border-gray-800" style={{ borderColor: themeColor.light }}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2 justify-between">
                  YOUR FAVORITES
                  <Star className="h-4 w-4" style={{ color: themeColor.textDark }} />
                </h3>
              </div>
              <div className="p-2">
                {favoriteBookmarks.slice(0, 5).map(bookmark => (
                  <button
                    key={bookmark.id}
                    onClick={() => handleBookmarkClick(bookmark)}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <BookmarkIcon icon={bookmark.icon} className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {bookmark.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Folders - Show only first 4 */}
        {filteredFolders.slice(0, 4).map(folder => (
          <div key={folder.id} className="min-w-[180px] flex-1 max-w-[250px]">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div 
                className="p-4 border-b border-gray-100 dark:border-gray-800"
                style={{ 
                  borderBottomColor: folder.color || '#3b82f6',
                  color: folder.color || '#3b82f6'
                }}
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {folder.name}
                </h3>
              </div>
              <div className="p-2">
                {folder.bookmarks?.slice(0, 5).map(bookmark => (
                  <button
                    key={bookmark.id}
                    onClick={() => handleBookmarkClick(bookmark)}
                    className="w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <BookmarkIcon icon={bookmark.icon} className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {bookmark.name}
                    </span>
                  </button>
                ))}
                {(!folder.bookmarks || folder.bookmarks.length === 0) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 px-2 py-2">
                    No bookmarks
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {filteredFolders.length > 4 && (
        <div className="text-center">
          <a 
            href="/dashboard/bookmarks"
            className="text-sm font-medium transition-colors"
            style={{ color: themeColor.text }}
            onMouseEnter={(e) => e.currentTarget.style.color = themeColor.dark}
            onMouseLeave={(e) => e.currentTarget.style.color = themeColor.text}
          >
            View all bookmarks →
          </a>
        </div>
      )}

      {filteredFolders.length === 0 && favoriteBookmarks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No bookmarks found</p>
        </div>
      )}

      <AddFolderDialog open={showFolderDialog} onOpenChange={setShowFolderDialog} />
      <AddBookmarkDialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog} />
    </div>
  )
}

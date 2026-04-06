'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useBookmarkStore } from '@/stores/useBookmarkStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, FolderPlus, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useThemeColor } from '@/hooks/useThemeColor'
import { 
  BookmarkIcon, 
  FolderCard, 
  NewBookmarksSection, 
  AddFolderDialog, 
  AddBookmarkDialog 
} from './components'

export function BookmarksPage() {
  const themeColor = useThemeColor()
  const searchParams = useSearchParams()
  const highlightedFolderId = searchParams.get('folder')
  
  const { 
    folders, 
    searchQuery,
    isLoading,
    fetchFolders,
    setSearchQuery,
    markAsRead,
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
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
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
            Add New Folder
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
            Add a Quick Link
          </Button>
        </div>
      </div>

      {/* New Bookmarks Section */}
      {!searchQuery && (
        <NewBookmarksSection
          bookmarks={newBookmarks}
          selectedBookmarks={selectedNewBookmarks}
          onToggleSelection={toggleNewBookmarkSelection}
          onBookmarkClick={handleBookmarkClick}
        />
      )}

      {/* Favorites Section */}
      {favoriteBookmarks.length > 0 && !searchQuery && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b dark:border-gray-800" style={{ borderColor: themeColor.light }}>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
              YOUR FAVORITES
              <Star className="h-4 w-4" style={{ color: themeColor.textDark }} />
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-2 p-4">
            {favoriteBookmarks.map(bookmark => (
              <div key={bookmark.id} className="flex items-center gap-3 group">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
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

      {/* Folders Grid - Staggered Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
        {filteredFolders.map((folder, index) => (
          <div
            key={folder.id}
            className="break-inside-avoid"
            style={{
              gridRowEnd: `span ${Math.min(folder.bookmarks?.length || 1, 6)}`
            }}
          >
            <FolderCard
              name={folder.name}
              color={folder.color}
              bookmarks={folder.bookmarks}
              onBookmarkClick={handleBookmarkClick}
              isHighlighted={highlightedFolderId === folder.id.toString()}
            />
          </div>
        ))}
      </div>

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

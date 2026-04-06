import { create } from 'zustand'
import { 
  Bookmark, 
  BookmarkFolder,
  getBookmarkFolders,
  getBookmarks,
  createBookmarkFolder,
  createBookmark,
  updateBookmarkFolder,
  updateBookmark,
  deleteBookmarkFolder,
  deleteBookmark,
  toggleBookmarkFavorite,
  markBookmarkAsRead
} from '@/services/bookmarkService'
import { logger } from '@/lib/logger'

interface BookmarkStore {
  folders: BookmarkFolder[]
  bookmarks: Bookmark[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  
  // Folder actions
  fetchFolders: () => Promise<void>
  addFolder: (data: any) => Promise<void>
  updateFolder: (id: number, data: any) => Promise<void>
  removeFolder: (id: number) => Promise<void>
  
  // Bookmark actions
  fetchBookmarks: (folderId?: number) => Promise<void>
  addBookmark: (data: any) => Promise<void>
  updateBookmark: (id: number, data: any) => Promise<void>
  removeBookmark: (id: number) => Promise<void>
  toggleFavorite: (id: number) => Promise<void>
  markAsRead: (id: number) => Promise<void>
  
  // UI actions
  setSearchQuery: (query: string) => void
  clearError: () => void
}

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  folders: [],
  bookmarks: [],
  isLoading: false,
  error: null,
  searchQuery: '',

  fetchFolders: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await getBookmarkFolders()
      console.log("fetchFolders", response)
      if (response.status === 200) {
        set({ folders: response.data })
      }
    } catch (error) {
      logger.error('Error fetching bookmark folders:', error)
      set({ error: 'Failed to load bookmark folders' })
    } finally {
      set({ isLoading: false })
    }
  },

  addFolder: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await createBookmarkFolder(data)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error creating bookmark folder:', error)
      set({ error: 'Failed to create bookmark folder' })
    } finally {
      set({ isLoading: false })
    }
  },

  updateFolder: async (id, data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await updateBookmarkFolder(id, data)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error updating bookmark folder:', error)
      set({ error: 'Failed to update bookmark folder' })
    } finally {
      set({ isLoading: false })
    }
  },

  removeFolder: async (id) => {
    try {
      set({ isLoading: true, error: null })
      const response = await deleteBookmarkFolder(id)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error deleting bookmark folder:', error)
      set({ error: 'Failed to delete bookmark folder' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchBookmarks: async (folderId?: number) => {
    try {
      set({ isLoading: true, error: null })
      const response = await getBookmarks(folderId)
      if (response.status === 200) {
        set({ bookmarks: response.data })
      }
    } catch (error) {
      logger.error('Error fetching bookmarks:', error)
      set({ error: 'Failed to load bookmarks' })
    } finally {
      set({ isLoading: false })
    }
  },

  addBookmark: async (data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await createBookmark(data)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error creating bookmark:', error)
      set({ error: 'Failed to create bookmark' })
    } finally {
      set({ isLoading: false })
    }
  },

  updateBookmark: async (id, data) => {
    try {
      set({ isLoading: true, error: null })
      const response = await updateBookmark(id, data)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error updating bookmark:', error)
      set({ error: 'Failed to update bookmark' })
    } finally {
      set({ isLoading: false })
    }
  },

  removeBookmark: async (id) => {
    try {
      set({ isLoading: true, error: null })
      const response = await deleteBookmark(id)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error deleting bookmark:', error)
      set({ error: 'Failed to delete bookmark' })
    } finally {
      set({ isLoading: false })
    }
  },

  toggleFavorite: async (id) => {
    try {
      const response = await toggleBookmarkFavorite(id)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error)
      set({ error: 'Failed to toggle favorite' })
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await markBookmarkAsRead(id)
      if (response.status === 200) {
        await get().fetchFolders()
      }
    } catch (error) {
      logger.error('Error marking as read:', error)
      set({ error: 'Failed to mark as read' })
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  clearError: () => set({ error: null })
}))

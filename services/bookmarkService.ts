import { apiRequest } from '@/services/api/clientConfig'
import { ApiResponse } from '@/types/api'
import { logger } from '@/lib/logger'

export interface BookmarkFolder {
  id: number
  name: string
  icon?: string
  color?: string
  user_id?: number
  client_id?: number
  is_shared: boolean
  order: number
  active: boolean
  created_at: Date
  updated_at: Date
  bookmarks?: Bookmark[]
}

export interface Bookmark {
  id: number
  name: string
  url: string
  icon?: string
  folder_id?: number
  user_id?: number
  client_id?: number
  is_favorite: boolean
  is_new: boolean
  order: number
  active: boolean
  created_at: Date
  updated_at: Date
  folder?: BookmarkFolder
}

export interface CreateBookmarkFolderData {
  name: string
  icon?: string
  color?: string
  user_id?: number
  client_id?: number
  is_shared?: boolean
  order?: number
}

export interface CreateBookmarkData {
  name: string
  url: string
  icon?: string
  folder_id?: number
  user_id?: number
  client_id?: number
  is_favorite?: boolean
  is_new?: boolean
  order?: number
}

// Bookmark Folder API calls
export const getBookmarkFolders = async (): Promise<ApiResponse<BookmarkFolder[]>> => {
  try {
    const response = await apiRequest<ApiResponse<BookmarkFolder[]>>('/bookmarks/folders', {
      method: 'GET'
    })
    return response
  } catch (error) {
    logger.error('Error fetching bookmark folders:', error)
    throw error
  }
}

export const createBookmarkFolder = async (data: CreateBookmarkFolderData): Promise<ApiResponse<BookmarkFolder>> => {
  try {
    const response = await apiRequest<ApiResponse<BookmarkFolder>>('/bookmarks/folders', {
      method: 'POST',
      data
    })
    return response
  } catch (error) {
    logger.error('Error creating bookmark folder:', error)
    throw error
  }
}

export const updateBookmarkFolder = async (id: number, data: Partial<CreateBookmarkFolderData>): Promise<ApiResponse<BookmarkFolder>> => {
  try {
    const response = await apiRequest<ApiResponse<BookmarkFolder>>(`/bookmarks/folders/${id}`, {
      method: 'PUT',
      data
    })
    return response
  } catch (error) {
    logger.error('Error updating bookmark folder:', error)
    throw error
  }
}

export const deleteBookmarkFolder = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await apiRequest<ApiResponse<void>>(`/bookmarks/folders/${id}`, {
      method: 'DELETE'
    })
    return response
  } catch (error) {
    logger.error('Error deleting bookmark folder:', error)
    throw error
  }
}

// Bookmark API calls
export const getBookmarks = async (folderId?: number): Promise<ApiResponse<Bookmark[]>> => {
  try {
    const url = folderId ? `/bookmarks?folder_id=${folderId}` : '/bookmarks'
    const response = await apiRequest<ApiResponse<Bookmark[]>>(url, {
      method: 'GET'
    })
    return response
  } catch (error) {
    logger.error('Error fetching bookmarks:', error)
    throw error
  }
}

export const createBookmark = async (data: CreateBookmarkData): Promise<ApiResponse<Bookmark>> => {
  try {
    const response = await apiRequest<ApiResponse<Bookmark>>('/bookmarks', {
      method: 'POST',
      data
    })
    return response
  } catch (error) {
    logger.error('Error creating bookmark:', error)
    throw error
  }
}

export const updateBookmark = async (id: number, data: Partial<CreateBookmarkData>): Promise<ApiResponse<Bookmark>> => {
  try {
    const response = await apiRequest<ApiResponse<Bookmark>>(`/bookmarks/${id}`, {
      method: 'PUT',
      data
    })
    return response
  } catch (error) {
    logger.error('Error updating bookmark:', error)
    throw error
  }
}

export const deleteBookmark = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await apiRequest<ApiResponse<void>>(`/bookmarks/${id}`, {
      method: 'DELETE'
    })
    return response
  } catch (error) {
    logger.error('Error deleting bookmark:', error)
    throw error
  }
}

export const toggleBookmarkFavorite = async (id: number): Promise<ApiResponse<Bookmark>> => {
  try {
    const response = await apiRequest<ApiResponse<Bookmark>>(`/bookmarks/${id}/favorite`, {
      method: 'POST'
    })
    return response
  } catch (error) {
    logger.error('Error toggling bookmark favorite:', error)
    throw error
  }
}

export const markBookmarkAsRead = async (id: number): Promise<ApiResponse<Bookmark>> => {
  try {
    const response = await apiRequest<ApiResponse<Bookmark>>(`/bookmarks/${id}/mark-read`, {
      method: 'POST'
    })
    return response
  } catch (error) {
    logger.error('Error marking bookmark as read:', error)
    throw error
  }
}

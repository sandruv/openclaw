import { ComboboxOption } from '@/components/ui/combobox'

interface CachedDropdownData {
  data: ComboboxOption[]
  timestamp: number
  expiresAt: number
  searchKey?: string
  clientId?: string
}

interface DropdownCacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of cached entries per type
}

interface SerializedCacheData {
  [key: string]: CachedDropdownData
}

class DropdownCache {
  private cache = new Map<string, CachedDropdownData>()
  private readonly storageKey = 'dropdown-cache-v1'
  private readonly pendingRequests = new Map<string, Promise<ComboboxOption[]>>()
  private saveTimeout: NodeJS.Timeout | null = null
  private readonly SAVE_DEBOUNCE_MS = 1000 // Debounce saves by 1 second
  private readonly MAX_TOTAL_CACHE_SIZE = 500 // Maximum total entries across all types
  private readonly configs: Record<string, DropdownCacheConfig> = {
    // Static data - longer cache times
    ticketTypes: { ttl: 30 * 60 * 1000, maxSize: 1 }, // 30 minutes
    priorities: { ttl: 30 * 60 * 1000, maxSize: 1 },
    impacts: { ttl: 30 * 60 * 1000, maxSize: 1 },
    urgencies: { ttl: 30 * 60 * 1000, maxSize: 1 },
    categories: { ttl: 30 * 60 * 1000, maxSize: 1 },
    subcategories: { ttl: 30 * 60 * 1000, maxSize: 10 },
    requestSubcategories: { ttl: 30 * 60 * 1000, maxSize: 1 },
    ticketSources: { ttl: 30 * 60 * 1000, maxSize: 1 },
    statuses: { ttl: 30 * 60 * 1000, maxSize: 1 },
    roles: { ttl: 30 * 60 * 1000, maxSize: 1 },
    
    // Dynamic data - shorter cache times
    clients: { ttl: 30 * 60 * 1000, maxSize: 50 }, // 30 minutes, multiple search results
    users: { ttl: 30 * 60 * 1000, maxSize: 100 }, // 30 minutes, per client
    sites: { ttl: 30 * 60 * 1000, maxSize: 50 }, // 30 minutes, per client
    agents: { ttl: 30 * 60 * 1000, maxSize: 100 }, // 30 minutes, per client
  }

  constructor() {
    this.loadFromSessionStorage()
  }

  private generateKey(type: string, searchKey?: string, clientId?: string): string {
    const parts = [type]
    if (clientId) parts.push(`client:${clientId}`)
    if (searchKey) parts.push(`search:${searchKey}`)
    return parts.join('|')
  }

  private loadFromSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return // Skip on server-side or if sessionStorage is not available
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey)
      if (!stored) return

      const serializedData: SerializedCacheData = JSON.parse(stored)
      const now = Date.now()

      // Load data back into cache, filtering out expired entries
      for (const [key, cachedData] of Object.entries(serializedData)) {
        if (now <= cachedData.expiresAt) {
          this.cache.set(key, cachedData)
        }
      }
    } catch (error) {
      console.warn('Failed to load dropdown cache from session storage:', error)
      // Clear corrupted data
      this.clearSessionStorage()
    }
  }

  private saveToSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return // Skip on server-side or if sessionStorage is not available
    }

    try {
      const serializedData: SerializedCacheData = {}
      
      // Convert Map to plain object for JSON serialization
      for (const [key, cachedData] of this.cache.entries()) {
        serializedData[key] = cachedData
      }

      sessionStorage.setItem(this.storageKey, JSON.stringify(serializedData))
    } catch (error) {
      console.warn('Failed to save dropdown cache to session storage:', error)
      // If storage is full, try to clear old data and retry once
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearSessionStorage()
        try {
          sessionStorage.setItem(this.storageKey, JSON.stringify({}))
        } catch (retryError) {
          console.error('Failed to clear and retry session storage save:', retryError)
        }
      }
    }
  }

  private debouncedSaveToSessionStorage(): void {
    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    
    // Set new timeout to save after debounce period
    this.saveTimeout = setTimeout(() => {
      this.saveToSessionStorage()
      this.saveTimeout = null
    }, this.SAVE_DEBOUNCE_MS)
  }

  private clearSessionStorage(): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return
    }

    try {
      sessionStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('Failed to clear dropdown cache from session storage:', error)
    }
  }

  set(type: string, data: ComboboxOption[], searchKey?: string, clientId?: string): void {
    const config = this.configs[type]
    if (!config) return

    const key = this.generateKey(type, searchKey, clientId)
    const now = Date.now()

    // Enforce total cache size limit - remove oldest entries if needed
    if (this.cache.size >= this.MAX_TOTAL_CACHE_SIZE) {
      const allEntries = Array.from(this.cache.entries())
      allEntries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toRemove = allEntries.slice(0, Math.floor(this.MAX_TOTAL_CACHE_SIZE * 0.2)) // Remove oldest 20%
      toRemove.forEach(([k]) => this.cache.delete(k))
      console.warn(`DropdownCache: Max size reached (${this.MAX_TOTAL_CACHE_SIZE}), removed ${toRemove.length} oldest entries`)
    }

    // Clean up old entries for this type if we're at max size
    const wasCleanedUp = this.cleanupType(type, config.maxSize)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + config.ttl,
      searchKey,
      clientId
    })

    // Persist to session storage (debounced to prevent excessive writes)
    this.debouncedSaveToSessionStorage()
  }

  get(type: string, searchKey?: string, clientId?: string): ComboboxOption[] | null {
    const key = this.generateKey(type, searchKey, clientId)
    const cached = this.cache.get(key)

    if (!cached) return null

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  has(type: string, searchKey?: string, clientId?: string): boolean {
    const key = this.generateKey(type, searchKey, clientId)
    const cached = this.cache.get(key)
    
    if (!cached) return false
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  invalidate(type: string, clientId?: string): void {
    const keysToDelete: string[] = []
    
    for (const [key, cached] of this.cache.entries()) {
      if (key.startsWith(type)) {
        // If clientId is specified, only invalidate entries for that client
        if (clientId && cached.clientId && cached.clientId !== clientId) {
          continue
        }
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    
    // Update session storage after invalidation
    if (keysToDelete.length > 0) {
      this.saveToSessionStorage()
    }
  }

  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    this.clearSessionStorage()
  }

  // Request deduplication methods
  isPending(type: string, searchKey?: string, clientId?: string): boolean {
    const key = this.generateKey(type, searchKey, clientId)
    return this.pendingRequests.has(key)
  }

  getPendingRequest(type: string, searchKey?: string, clientId?: string): Promise<ComboboxOption[]> | null {
    const key = this.generateKey(type, searchKey, clientId)
    return this.pendingRequests.get(key) || null
  }

  setPendingRequest(type: string, promise: Promise<ComboboxOption[]>, searchKey?: string, clientId?: string): void {
    const key = this.generateKey(type, searchKey, clientId)
    this.pendingRequests.set(key, promise)
    
    // Clean up the pending request when it completes (success or failure)
    promise.finally(() => {
      this.pendingRequests.delete(key)
    })
  }

  // Cross-type request sharing for users/agents (same API endpoint)
  getSharedUserRequest(searchKey?: string, clientId?: string): Promise<ComboboxOption[]> | null {
    // Check for existing requests for both users and agents
    const userRequest = this.getPendingRequest('users', searchKey, clientId)
    const agentRequest = this.getPendingRequest('agents', searchKey, clientId)
    
    return userRequest || agentRequest
  }

  setSharedUserRequest(promise: Promise<ComboboxOption[]>, searchKey?: string, clientId?: string): void {
    // Set the same promise for both users and agents since they use the same API
    this.setPendingRequest('users', promise, searchKey, clientId)
    this.setPendingRequest('agents', promise, searchKey, clientId)
  }

  private cleanupType(type: string, maxSize: number): boolean {
    const typeEntries: [string, CachedDropdownData][] = []
    
    for (const [key, cached] of this.cache.entries()) {
      if (key.startsWith(type)) {
        typeEntries.push([key, cached])
      }
    }
    
    if (typeEntries.length >= maxSize) {
      // Sort by timestamp (oldest first) and remove excess entries
      typeEntries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      const toRemove = typeEntries.slice(0, typeEntries.length - maxSize + 1)
      toRemove.forEach(([key]) => this.cache.delete(key))
      return true // Indicate that entries were removed
    }
    
    return false // No entries were removed
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key))
    
    // Update session storage after cleanup if any entries were removed (debounced)
    if (keysToDelete.length > 0) {
      this.debouncedSaveToSessionStorage()
    }
  }

  // Get cache statistics for debugging
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {
      totalEntries: this.cache.size,
      sessionStorageEnabled: typeof window !== 'undefined' && typeof sessionStorage !== 'undefined',
      types: {}
    }

    // Add session storage size if available
    if (stats.sessionStorageEnabled) {
      try {
        const stored = sessionStorage.getItem(this.storageKey)
        stats.sessionStorageSize = stored ? stored.length : 0
        stats.sessionStorageEntries = stored ? Object.keys(JSON.parse(stored)).length : 0
      } catch (error) {
        stats.sessionStorageError = 'Failed to read session storage'
      }
    }
    
    for (const [key, cached] of this.cache.entries()) {
      const type = key.split('|')[0]
      if (!stats.types[type]) {
        stats.types[type] = { count: 0, expired: 0 }
      }
      stats.types[type].count++
      
      if (Date.now() > cached.expiresAt) {
        stats.types[type].expired++
      }
    }
    
    return stats
  }
}

export const dropdownCache = new DropdownCache()

// NOTE: Automatic cleanup removed to prevent memory leaks
// Call dropdownCache.cleanup() manually if needed or use session storage expiration

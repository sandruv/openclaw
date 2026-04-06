interface CachedValidation {
  token: string;
  isValid: boolean;
  timestamp: number;
  expiresAt: number;
}

class MiddlewareCache {
  private cache = new Map<string, CachedValidation>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for middleware

  set(token: string, isValid: boolean): void {
    this.cache.set(token, {
      token,
      isValid,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  get(token: string): boolean | null {
    const cached = this.cache.get(token);
    
    if (!cached) return null;
    
    // Check if cache is expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(token);
      return null;
    }
    
    return cached.isValid;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [token, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(token);
      }
    }
  }
}

export const middlewareCache = new MiddlewareCache();

// NOTE: Automatic cleanup removed to prevent memory leaks
// Cleanup happens automatically on get() when items expire

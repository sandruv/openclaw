interface CachedSession {
  user: any;
  token: string;
  timestamp: number;
  expiresAt: number;
}

class SessionCache {
  private cache: CachedSession | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly VALIDATION_INTERVAL = 30 * 1000; // 30 seconds

  set(user: any, token: string, expiresIn: number = this.CACHE_DURATION): void {
    this.cache = {
      user,
      token,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiresIn
    };
  }

  get(): CachedSession | null {
    if (!this.cache) return null;
    
    // Check if cache is expired
    if (Date.now() > this.cache.expiresAt) {
      this.clear();
      return null;
    }
    
    return this.cache;
  }

  isValid(token: string): boolean {
    const cached = this.get();
    return cached !== null && cached.token === token;
  }

  shouldRevalidate(): boolean {
    if (!this.cache) return true;
    
    const timeSinceLastValidation = Date.now() - this.cache.timestamp;
    return timeSinceLastValidation > this.VALIDATION_INTERVAL;
  }

  clear(): void {
    this.cache = null;
  }

  getUser(): any | null {
    const cached = this.get();
    return cached?.user || null;
  }

  updateTimestamp(): void {
    if (this.cache) {
      this.cache.timestamp = Date.now();
    }
  }
}

export const sessionCache = new SessionCache();

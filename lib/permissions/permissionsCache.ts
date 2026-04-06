/**
 * Permissions Cache for Edge Runtime
 * 
 * Caches role-permission mappings fetched from /api/role-permissions.
 * Works in Edge Runtime (uses fetch, not Prisma directly).
 * 
 * Cache TTL: 24 hours
 */

interface CachedPermissions {
  data: Record<number, string[]>;  // roleId -> permission names
  timestamp: number;
  expiresAt: number;
}

class PermissionsCache {
  private cache: CachedPermissions | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private fetchPromise: Promise<Record<number, string[]>> | null = null;

  /**
   * Get permissions for a specific role
   * Fetches from API if cache is empty or expired
   */
  async getRolePermissions(roleId: number, baseUrl?: string): Promise<string[]> {
    const permissions = await this.getAllPermissions(baseUrl);
    return permissions[roleId] || [];
  }

  /**
   * Get all role-permission mappings
   * Fetches from API if cache is empty or expired
   */
  async getAllPermissions(baseUrl?: string): Promise<Record<number, string[]>> {
    // Return cached data if valid
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.data;
    }

    // Prevent multiple concurrent fetches
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchPermissions(baseUrl);
    
    try {
      const data = await this.fetchPromise;
      return data;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * Fetch permissions from API
   */
  private async fetchPermissions(baseUrl?: string): Promise<Record<number, string[]>> {
    try {
      // Construct the URL - in middleware, we need the full URL
      const url = baseUrl 
        ? `${baseUrl}/api/role-permissions`
        : '/api/role-permissions';

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't cache at the fetch level, we handle caching ourselves
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.status}`);
      }

      const result = await response.json();
      
      // Update cache
      this.cache = {
        data: result.data,
        timestamp: result.timestamp || Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION,
      };

      return result.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      
      // Return cached data if available (even if expired)
      if (this.cache) {
        console.warn('Using stale permissions cache due to fetch error');
        return this.cache.data;
      }
      
      // Return empty object if no cache available
      return {};
    }
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(roleId: number, permission: string, baseUrl?: string): Promise<boolean> {
    const permissions = await this.getRolePermissions(roleId, baseUrl);
    return permissions.includes(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  async hasAnyPermission(roleId: number, permissions: string[], baseUrl?: string): Promise<boolean> {
    const rolePermissions = await this.getRolePermissions(roleId, baseUrl);
    return permissions.some(p => rolePermissions.includes(p));
  }

  /**
   * Invalidate the cache
   * Call this when permissions are updated
   */
  invalidate(): void {
    this.cache = null;
  }

  /**
   * Check if cache is valid
   */
  isValid(): boolean {
    return this.cache !== null && Date.now() < this.cache.expiresAt;
  }

  /**
   * Get cache status for debugging
   */
  getStatus(): { cached: boolean; expiresIn: number | null } {
    if (!this.cache) {
      return { cached: false, expiresIn: null };
    }
    return {
      cached: true,
      expiresIn: Math.max(0, this.cache.expiresAt - Date.now()),
    };
  }
}

// Export singleton instance
export const permissionsCache = new PermissionsCache();

// Export helper function for convenience
export async function getRolePermissions(roleId: number, baseUrl?: string): Promise<string[]> {
  return permissionsCache.getRolePermissions(roleId, baseUrl);
}

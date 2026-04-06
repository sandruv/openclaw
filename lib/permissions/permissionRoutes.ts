/**
 * Permission to Routes Mapping
 * 
 * This file defines which routes each permission grants access to.
 * Used by middleware for route protection and client-side for UI feature toggles.
 */

export const PERMISSION_ROUTES: Record<string, string[]> = {
  'access_admin': ['/admin'],
  'access_tasks': ['/tasks'],
  'access_clients': ['/clients', '/user'],
  'access_assistant': ['/assistant'],
  'access_chat': ['/chat'],
  'access_dashboard': ['/dashboard'],
  'access_settings': ['/settings'],
  'access_patch_updates': ['/patch-updates'],
};

/**
 * Get all permissions required for a specific route
 */
export function getPermissionsForRoute(pathname: string): string[] {
  const permissions: string[] = [];
  
  for (const [permission, routes] of Object.entries(PERMISSION_ROUTES)) {
    if (routes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
      permissions.push(permission);
    }
  }
  
  return permissions;
}

/**
 * Check if a permission grants access to a specific route
 */
export function permissionGrantsRouteAccess(permission: string, pathname: string): boolean {
  const routes = PERMISSION_ROUTES[permission] || [];
  return routes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Get all routes granted by a set of permissions
 */
export function getRoutesForPermissions(permissions: string[]): string[] {
  const routes: Set<string> = new Set();
  
  for (const permission of permissions) {
    const permRoutes = PERMISSION_ROUTES[permission] || [];
    permRoutes.forEach(route => routes.add(route));
  }
  
  return Array.from(routes);
}

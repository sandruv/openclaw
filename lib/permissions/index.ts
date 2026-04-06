/**
 * Permissions Module
 * 
 * Centralized exports for the permissions system.
 * 
 * Usage:
 * - Middleware: Uses permissionsCache for route protection
 * - Client: Uses usePermissions hook or PermissionGate component
 */

// Permission-route mapping
export { 
  PERMISSION_ROUTES, 
  getPermissionsForRoute, 
  permissionGrantsRouteAccess,
  getRoutesForPermissions,
} from './permissionRoutes';

// Permissions cache (for middleware/server-side)
export { 
  permissionsCache, 
  getRolePermissions,
} from './permissionsCache';

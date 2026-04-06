import { dropdownService } from '../services/dropdownService';

// Re-export types from types.ts (Edge Runtime safe)
// RoleType is an enum (both type and value), so it needs regular export
export { RoleType, ADMIN_USER_ID, RoleNames } from './roleProvider/types';
export type { RoleRecord } from './roleProvider/types';
import { RoleType, RoleRecord, ADMIN_USER_ID, RoleNames } from './roleProvider/types';

// Role Provider class using services instead of direct database access
export class RoleIdProvider {
  // Static map of role types for fallback and quick reference
  private static readonly roleTypes = new Map<RoleType, string>([
    [RoleType.Agent, 'Agent'],
    [RoleType.ClientUser, 'Client User'],
    [RoleType.Admin, 'Admin'],
    [RoleType.InternalUser, 'Internal User'],
    [RoleType.SuperAdmin, 'Super Admin'],
  ]);

  // Cache for role data
  private roleCache: RoleRecord[] | null = null;

  constructor() {
    // No need for Prisma instance anymore
  }

  // Get name for a specific role type
  getTypeName(type: RoleType): string {
    return RoleIdProvider.roleTypes.get(type) || 'Unknown';
  }

  // Check if a user is super-admin (role_id=5 or user.id=1)
  isSuperAdmin(user: { role_id?: number; id?: number } | null | undefined): boolean {
    if (!user) return false;
    return user.role_id === RoleType.SuperAdmin || user.id === ADMIN_USER_ID;
  }

  // Check if a user is admin based on role_id or super-admin
  isAdmin(user: { role_id?: number; id?: number } | null | undefined): boolean {
    if (!user) return false;
    return user.role_id === RoleType.Admin || this.isSuperAdmin(user);
  }

  // Check if a user is agent
  isAgent(user: { role_id?: number } | null | undefined): boolean {
    if (!user) return false;
    return user.role_id === RoleType.Agent;
  }

  // Check if a user is client user (external)
  isClientUser(user: { role_id?: number } | null | undefined): boolean {
    if (!user) return false;
    return user.role_id === RoleType.ClientUser;
  }

  // Check if a user is internal user
  isInternalUser(user: { role_id?: number } | null | undefined): boolean {
    if (!user) return false;
    return user.role_id === RoleType.InternalUser;
  }

  // Check if user has dashboard-only access (client-user or internal-user)
  isDashboardOnly(user: { role_id?: number } | null | undefined): boolean {
    if (!user) return false;
    return this.isClientUser(user) || this.isInternalUser(user);
  }

  // Check if user can access tasks (agent, admin, super-admin)
  canAccessTasks(user: { role_id?: number; id?: number } | null | undefined): boolean {
    if (!user) return false;
    return this.isAgent(user) || this.isAdmin(user);
  }

  // Check if a role type is valid
  isValidType(type: RoleType): boolean {
    return RoleIdProvider.roleTypes.has(type);
  }

  // Get role ID by name
  async getIdByName(name: string): Promise<number | undefined> {
    try {
      const roles = await this.getAllRoles();
      const role = roles.find(r => 
        r.name.toLowerCase() === name.toLowerCase()
      );
      
      return role?.id;
    } catch (error) {
      console.error('Error getting role ID by name:', error);
      return undefined;
    }
  }

  // Get all role types using the service
  async getAllRoles(): Promise<RoleRecord[]> {
    try {
      // Return cached roles if available
      if (this.roleCache) {
        return this.roleCache;
      }

      // Get roles from the service
      const response = await dropdownService.getRoles();
      
      if (response.status === 200 && response.data) {
        // Map the response to RoleRecord format
        const roles = response.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          active: true, // Default to true since Role doesn't have this property
        }));
        
        // Cache the results
        this.roleCache = roles;
        
        return roles;
      } else {
        throw new Error('Failed to fetch roles from API');
      }
    } catch (error) {
      console.error('Error getting all roles:', error);
      
      // Fallback to static roles if API call fails
      const fallbackRoles: RoleRecord[] = [];
      
      for (const [id, name] of RoleIdProvider.roleTypes.entries()) {
        fallbackRoles.push({
          id,
          name,
          active: true,
        });
      }
      
      return fallbackRoles;
    }
  }
  
  // Clear the role cache to force refresh on next getAllRoles call
  clearCache(): void {
    this.roleCache = null;
  }

  // Helper method to require admin access (throws error if not admin)
  requireAdmin(user: { role_id?: number; id?: number } | null | undefined): void {
    if (!user || !this.isAdmin(user)) {
      throw new Error('Admin access required');
    }
  }

  // Helper method to get admin role ID
  getAdminRoleId(): number {
    return RoleType.Admin;
  }

  // Helper method to get agent role ID
  getAgentRoleId(): number {
    return RoleType.Agent;
  }

  // Helper method to get client user role ID
  getClientUserRoleId(): number {
    return RoleType.ClientUser;
  }

  // Helper method to get internal user role ID
  getInternalUserRoleId(): number {
    return RoleType.InternalUser;
  }

  // Helper method to get super admin role ID
  getSuperAdminRoleId(): number {
    return RoleType.SuperAdmin;
  }

  // Get role name by ID
  getRoleName(roleId: number): string {
    return RoleNames[roleId as RoleType] || 'Unknown';
  }

  // Get default redirect path based on role
  getDefaultRedirect(user: { role_id?: number; id?: number } | null | undefined): string {
    if (!user) return '/signin';
    if (this.canAccessTasks(user)) return '/tasks';
    return '/dashboard';
  }

  // Helper method to get admin user ID constant
  getAdminUserId(): number {
    return ADMIN_USER_ID;
  }
}

// Create a singleton instance for global use
export const RoleProvider = new RoleIdProvider();

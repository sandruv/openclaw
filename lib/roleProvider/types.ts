// Types of role IDs - matches database roles table
export enum RoleType {
  Agent = 1,        // Internal staff, task management
  ClientUser = 2,   // External client user
  Admin = 3,        // Full access including /admin
  InternalUser = 4, // Internal user (dashboard only)
  SuperAdmin = 5    // Full system access
}

// Interface for role record
export interface RoleRecord {
  id: number;
  name: string;
  active: boolean;
}

// Special admin user ID (default super-admin)
export const ADMIN_USER_ID = 1;

// Role names for display
export const RoleNames: Record<any, string> = {
  [RoleType.Agent]: 'Agent',
  [RoleType.ClientUser]: 'Client User',
  [RoleType.Admin]: 'Admin',
  [RoleType.InternalUser]: 'Internal User',
  [RoleType.SuperAdmin]: 'Super Admin',
};

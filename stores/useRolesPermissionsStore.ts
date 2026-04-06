import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  rolesPermissionsService,
  Role,
  Permission,
  RolePermission,
  CreateRoleData,
  CreatePermissionData,
  UpdateRolePermissionsData,
} from '@/services/rolesPermissionsService';
import { getErrorMessage } from '@/lib/utils';

interface RolesPermissionsState {
  // Data
  roles: Role[];
  permissions: Permission[];
  rolePermissions: Map<number, RolePermission[]>; // roleId -> permissions
  selectedRole: Role | null;

  // Loading states
  rolesLoading: boolean;
  permissionsLoading: boolean;
  rolePermissionsLoading: boolean;
  createRoleLoading: boolean;
  createPermissionLoading: boolean;
  updatePermissionLoading: boolean;

  // Error states
  rolesError: string | null;
  permissionsError: string | null;
  rolePermissionsError: string | null;
  createRoleError: string | null;
  createPermissionError: string | null;
  updatePermissionError: string | null;

  // Fetch timestamps for caching
  rolesFetchedAt: number | null;
  permissionsFetchedAt: number | null;
}

interface RolesPermissionsActions {
  // Fetch actions
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  fetchRolePermissions: (roleId: number) => Promise<void>;
  fetchAll: () => Promise<void>;

  // Create actions
  createRole: (data: CreateRoleData) => Promise<Role | null>;
  createPermission: (data: CreatePermissionData) => Promise<Permission | null>;

  // Update actions
  updateRolePermissions: (roleId: number, data: UpdateRolePermissionsData) => Promise<boolean>;

  // Selection
  setSelectedRole: (role: Role | null) => void;

  // Helpers
  getRolePermissions: (roleId: number) => RolePermission[];
  hasPermission: (roleId: number, permissionId: number) => boolean;
  clearErrors: () => void;
}

type RolesPermissionsStore = RolesPermissionsState & RolesPermissionsActions;

const initialState: RolesPermissionsState = {
  roles: [],
  permissions: [],
  rolePermissions: new Map(),
  selectedRole: null,
  rolesLoading: false,
  permissionsLoading: false,
  rolePermissionsLoading: false,
  createRoleLoading: false,
  createPermissionLoading: false,
  updatePermissionLoading: false,
  rolesError: null,
  permissionsError: null,
  rolePermissionsError: null,
  createRoleError: null,
  createPermissionError: null,
  updatePermissionError: null,
  rolesFetchedAt: null,
  permissionsFetchedAt: null,
};

export const useRolesPermissionsStore = create<RolesPermissionsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch roles
      fetchRoles: async () => {
        set({ rolesLoading: true, rolesError: null });
        try {
          const response = await rolesPermissionsService.getRoles();
          if (response.status === 200 && response.data) {
            set({
              roles: response.data || [],
              rolesLoading: false,
              rolesFetchedAt: Date.now(),
            });
          } else {
            set({
              rolesError: 'Failed to fetch roles',
              rolesLoading: false,
            });
          }
        } catch (error) {
          set({
            rolesError: getErrorMessage(error),
            rolesLoading: false,
          });
        }
      },

      // Fetch permissions
      fetchPermissions: async () => {
        set({ permissionsLoading: true, permissionsError: null });
        try {
          const response = await rolesPermissionsService.getPermissions();
          if (response.status === 200 && response.data) {
            set({
              permissions: response.data || [],
              permissionsLoading: false,
              permissionsFetchedAt: Date.now(),
            });
          } else {
            set({
              permissionsError: 'Failed to fetch permissions',
              permissionsLoading: false,
            });
          }
        } catch (error) {
          set({
            permissionsError: getErrorMessage(error),
            permissionsLoading: false,
          });
        }
      },

      // Fetch role permissions
      fetchRolePermissions: async (roleId: number) => {
        set({ rolePermissionsLoading: true, rolePermissionsError: null });
        try {
          const response = await rolesPermissionsService.getRolePermissions(roleId);
          if (response.status === 200 && response.data) {
            const newMap = new Map(get().rolePermissions);
            newMap.set(roleId, response.data || []);
            set({
              rolePermissions: newMap,
              rolePermissionsLoading: false,
            });
          } else {
            set({
              rolePermissionsError: 'Failed to fetch role permissions',
              rolePermissionsLoading: false,
            });
          }
        } catch (error) {
          set({
            rolePermissionsError: getErrorMessage(error),
            rolePermissionsLoading: false,
          });
        }
      },

      // Fetch all data
      fetchAll: async () => {
        await Promise.all([get().fetchRoles(), get().fetchPermissions()]);
      },

      // Create role
      createRole: async (data: CreateRoleData) => {
        set({ createRoleLoading: true, createRoleError: null });
        try {
          const response = await rolesPermissionsService.createRole(data);
          if (response.status === 201 && response.data) {
            const newRole = response.data;
            set({
              roles: [...get().roles, newRole],
              createRoleLoading: false,
            });
            return newRole;
          } else {
            set({
              createRoleError: 'Failed to create role',
              createRoleLoading: false,
            });
            return null;
          }
        } catch (error) {
          set({
            createRoleError: getErrorMessage(error),
            createRoleLoading: false,
          });
          return null;
        }
      },

      // Create permission
      createPermission: async (data: CreatePermissionData) => {
        set({ createPermissionLoading: true, createPermissionError: null });
        try {
          const response = await rolesPermissionsService.createPermission(data);
          if (response.status === 201 && response.data) {
            const newPermission = response.data;
            set({
              permissions: [...get().permissions, newPermission],
              createPermissionLoading: false,
            });
            return newPermission;
          } else {
            set({
              createPermissionError: 'Failed to create permission',
              createPermissionLoading: false,
            });
            return null;
          }
        } catch (error) {
          set({
            createPermissionError: getErrorMessage(error),
            createPermissionLoading: false,
          });
          return null;
        }
      },

      // Update role permissions
      updateRolePermissions: async (roleId: number, data: UpdateRolePermissionsData) => {
        set({ updatePermissionLoading: true, updatePermissionError: null });
        try {
          const response = await rolesPermissionsService.updateRolePermissions(roleId, data);
          if (response.status === 200) {
            // Optimistically update local state
            const newMap = new Map(get().rolePermissions);
            const currentPermissions = newMap.get(roleId) || [];

            if (data.action === 'add') {
              newMap.set(roleId, [
                ...currentPermissions,
                { role_id: roleId, permission_id: data.permission_id },
              ]);
            } else {
              newMap.set(
                roleId,
                currentPermissions.filter((rp) => rp.permission_id !== data.permission_id)
              );
            }

            set({
              rolePermissions: newMap,
              updatePermissionLoading: false,
            });
            return true;
          } else {
            set({
              updatePermissionError: 'Failed to update role permissions',
              updatePermissionLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            updatePermissionError: getErrorMessage(error),
            updatePermissionLoading: false,
          });
          return false;
        }
      },

      // Set selected role
      setSelectedRole: (role: Role | null) => {
        set({ selectedRole: role });
        if (role) {
          get().fetchRolePermissions(role.id);
        }
      },

      // Get role permissions
      getRolePermissions: (roleId: number) => {
        return get().rolePermissions.get(roleId) || [];
      },

      // Check if role has permission
      hasPermission: (roleId: number, permissionId: number) => {
        const permissions = get().rolePermissions.get(roleId) || [];
        return permissions.some((rp) => rp.permission_id === permissionId);
      },

      // Clear errors
      clearErrors: () => {
        set({
          rolesError: null,
          permissionsError: null,
          rolePermissionsError: null,
          createRoleError: null,
          createPermissionError: null,
          updatePermissionError: null,
        });
      },
    }),
    { name: 'RolesPermissionsStore' }
  )
);

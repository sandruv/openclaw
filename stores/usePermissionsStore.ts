import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiRequest } from '@/lib/api';

interface PermissionsState {
  permissions: string[];
  isLoading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

interface PermissionsActions {
  fetchPermissions: (roleId: number) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  clearPermissions: () => void;
  setPermissions: (permissions: string[]) => void;
}

type PermissionsStore = PermissionsState & PermissionsActions;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for client-side cache

export const usePermissionsStore = create<PermissionsStore>()(
  devtools(
    (set, get) => ({
      // State
      permissions: [],
      isLoading: false,
      error: null,
      fetchedAt: null,

      // Actions
      fetchPermissions: async (roleId: number) => {
        const { fetchedAt, permissions } = get();
        
        // Return cached if still valid
        if (fetchedAt && Date.now() - fetchedAt < CACHE_DURATION && permissions.length > 0) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await apiRequest<{
            data: Record<number, string[]>;
            timestamp: number;
            status: number;
          }>('/api/role-permissions');

          if (response.status === 200 && response.data) {
            const rolePermissions = response.data[roleId] || [];
            set({
              permissions: rolePermissions,
              isLoading: false,
              fetchedAt: Date.now(),
            });
          } else {
            set({
              error: 'Failed to fetch permissions',
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching permissions:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch permissions',
            isLoading: false,
          });
        }
      },

      hasPermission: (permission: string) => {
        return get().permissions.includes(permission);
      },

      hasAnyPermission: (permissions: string[]) => {
        const userPermissions = get().permissions;
        return permissions.some(p => userPermissions.includes(p));
      },

      hasAllPermissions: (permissions: string[]) => {
        const userPermissions = get().permissions;
        return permissions.every(p => userPermissions.includes(p));
      },

      clearPermissions: () => {
        set({
          permissions: [],
          isLoading: false,
          error: null,
          fetchedAt: null,
        });
      },

      setPermissions: (permissions: string[]) => {
        set({
          permissions,
          fetchedAt: Date.now(),
        });
      },
    }),
    { name: 'permissions-store' }
  )
);

// Selector hooks for common use cases
export const useHasPermission = (permission: string) => {
  return usePermissionsStore(state => state.permissions.includes(permission));
};

export const useHasAnyPermission = (permissions: string[]) => {
  return usePermissionsStore(state => 
    permissions.some(p => state.permissions.includes(p))
  );
};

export const useHasAllPermissions = (permissions: string[]) => {
  return usePermissionsStore(state => 
    permissions.every(p => state.permissions.includes(p))
  );
};

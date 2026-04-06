import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RoleType, RoleNames } from '@/lib/roleProvider/types';

interface ViewAsRoleState {
  simulatedRoleId: number | null;  // null = normal mode
  isSimulating: boolean;
  originalRoleId: number | null;
}

interface ViewAsRoleActions {
  startSimulation: (roleId: number, originalRoleId: number) => void;
  stopSimulation: () => void;
  getEffectiveRoleId: (actualRoleId: number) => number;
  getSimulatedRoleName: () => string | null;
}

type ViewAsRoleStore = ViewAsRoleState & ViewAsRoleActions;

// Roles that admins can simulate (excludes Admin and SuperAdmin)
export const SIMULATABLE_ROLES = [
  { id: RoleType.Agent, name: RoleNames[RoleType.Agent] },
  { id: RoleType.ClientUser, name: RoleNames[RoleType.ClientUser] },
  { id: RoleType.InternalUser, name: RoleNames[RoleType.InternalUser] },
];

// Check if user can use View As Role feature (Admin or SuperAdmin only)
export const canUseViewAsRole = (roleId: number | undefined): boolean => {
  if (!roleId) return false;
  return roleId === RoleType.Admin || roleId === RoleType.SuperAdmin;
};

export const useViewAsRoleStore = create<ViewAsRoleStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        simulatedRoleId: null,
        isSimulating: false,
        originalRoleId: null,

        // Actions
        startSimulation: (roleId: number, originalRoleId: number) => {
          // Only allow simulation of lower roles (Agent, ClientUser, InternalUser)
          const isValidRole = SIMULATABLE_ROLES.some(r => r.id === roleId);
          if (!isValidRole) {
            console.warn(`Cannot simulate role ${roleId} - not in simulatable roles list`);
            return;
          }

          set({
            simulatedRoleId: roleId,
            isSimulating: true,
            originalRoleId,
          });
        },

        stopSimulation: () => {
          set({
            simulatedRoleId: null,
            isSimulating: false,
            originalRoleId: null,
          });
        },

        getEffectiveRoleId: (actualRoleId: number) => {
          const { simulatedRoleId, isSimulating } = get();
          if (isSimulating && simulatedRoleId !== null) {
            return simulatedRoleId;
          }
          return actualRoleId;
        },

        getSimulatedRoleName: () => {
          const { simulatedRoleId, isSimulating } = get();
          if (!isSimulating || simulatedRoleId === null) {
            return null;
          }
          return RoleNames[simulatedRoleId as RoleType] || 'Unknown Role';
        },
      }),
      {
        name: 'view-as-role-storage',
        // Use sessionStorage so simulation is cleared on browser close
        // but persists across page refreshes within the same tab
        storage: {
          getItem: (name) => {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name, value) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            sessionStorage.removeItem(name);
          },
        },
      }
    ),
    { name: 'view-as-role-store' }
  )
);

// Selector hooks
export const useIsSimulating = () => useViewAsRoleStore(state => state.isSimulating);
export const useSimulatedRoleId = () => useViewAsRoleStore(state => state.simulatedRoleId);
export const useSimulatedRoleName = () => useViewAsRoleStore(state => state.getSimulatedRoleName());

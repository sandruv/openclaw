import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStatuses, getRequestSubcategories, getEnvVariables, EnvVariable, getAdminUsers, AdminUser } from '@/services/initializationService';
import { Status } from '@/types/status';

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
  active: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface SystemState {
  // Data
  statuses: Status[];
  subcategories: Subcategory[];
  envVariables: EnvVariable[];
  adminUsers: AdminUser[];
  
  // Loading states
  isLoadingStatuses: boolean;
  isLoadingSubcategories: boolean;
  isLoadingEnvVariables: boolean;
  isLoadingAdminUsers: boolean;
  
  // Errors
  statusesError: string | null;
  subcategoriesError: string | null;
  envVariablesError: string | null;
  adminUsersError: string | null;
  
  // Fetch timestamps (to know when data was last fetched)
  statusesFetchedAt: number | null;
  subcategoriesFetchedAt: number | null;
  envVariablesFetchedAt: number | null;
  adminUsersFetchedAt: number | null;
  
  // Actions
  fetchStatuses: () => Promise<void>;
  fetchSubcategories: () => Promise<void>;
  fetchEnvVariables: () => Promise<void>;
  fetchAdminUsers: () => Promise<void>;
  fetchAll: () => Promise<void>;
  setStatuses: (statuses: Status[]) => void;
  setSubcategories: (subcategories: Subcategory[]) => void;
  setEnvVariables: (envVariables: EnvVariable[]) => void;
  setAdminUsers: (adminUsers: AdminUser[]) => void;
  clearErrors: () => void;
  reset: () => void;
}

export const useSystemStore = create<SystemState>()(
  persist(
    (set, get) => ({
      // Initial state
      statuses: [],
      subcategories: [],
      envVariables: [],
      adminUsers: [],
      isLoadingStatuses: false,
      isLoadingSubcategories: false,
      isLoadingEnvVariables: false,
      isLoadingAdminUsers: false,
      statusesError: null,
      subcategoriesError: null,
      envVariablesError: null,
      adminUsersError: null,
      statusesFetchedAt: null,
      subcategoriesFetchedAt: null,
      envVariablesFetchedAt: null,
      adminUsersFetchedAt: null,

      fetchStatuses: async () => {
        set({ isLoadingStatuses: true, statusesError: null });
        
        try {
          const response = await getStatuses();
          
          if (response.status === 200 && response.data) {
            set({ 
              statuses: response.data,
              statusesFetchedAt: Date.now()
            });
          } else {
            set({ statusesError: response.message || 'Failed to retrieve task statuses' });
          }
        } catch (err) {
          console.error('Error fetching statuses:', err);
          set({ statusesError: 'Error connecting to server' });
        } finally {
          set({ isLoadingStatuses: false });
        }
      },

      fetchSubcategories: async () => {
        set({ isLoadingSubcategories: true, subcategoriesError: null });
        
        try {
          const response = await getRequestSubcategories();
          
          if (response.status === 200 && response.data) {
            set({ 
              subcategories: response.data,
              subcategoriesFetchedAt: Date.now()
            });
          } else {
            set({ subcategoriesError: response.message || 'Failed to retrieve subcategories' });
          }
        } catch (err) {
          console.error('Error fetching subcategories:', err);
          set({ subcategoriesError: 'Error connecting to server' });
        } finally {
          set({ isLoadingSubcategories: false });
        }
      },

      fetchEnvVariables: async () => {
        set({ isLoadingEnvVariables: true, envVariablesError: null });
        
        try {
          const response = await getEnvVariables();
          
          if (response.status === 200 && response.data) {
            set({ 
              envVariables: response.data,
              envVariablesFetchedAt: Date.now()
            });
          } else {
            set({ envVariablesError: response.message || 'Failed to retrieve environment variables' });
          }
        } catch (err) {
          console.error('Error fetching environment variables:', err);
          set({ envVariablesError: 'Error connecting to server' });
        } finally {
          set({ isLoadingEnvVariables: false });
        }
      },

      fetchAdminUsers: async () => {
        set({ isLoadingAdminUsers: true, adminUsersError: null });
        
        try {
          const response = await getAdminUsers();
          
          if (response.status === 200 && response.data) {
            set({ 
              adminUsers: response.data,
              adminUsersFetchedAt: Date.now()
            });
          } else {
            set({ adminUsersError: response.message || 'Failed to retrieve admin users' });
          }
        } catch (err) {
          console.error('Error fetching admin users:', err);
          set({ adminUsersError: 'Error connecting to server' });
        } finally {
          set({ isLoadingAdminUsers: false });
        }
      },

      fetchAll: async () => {
        const { fetchStatuses, fetchSubcategories } = get();
        await Promise.all([fetchStatuses(), fetchSubcategories()]);
      },

      setStatuses: (statuses) => set({ statuses, statusesFetchedAt: Date.now() }),
      
      setSubcategories: (subcategories) => set({ subcategories, subcategoriesFetchedAt: Date.now() }),
      
      setEnvVariables: (envVariables) => set({ envVariables, envVariablesFetchedAt: Date.now() }),
      
      setAdminUsers: (adminUsers) => set({ adminUsers, adminUsersFetchedAt: Date.now() }),
      
      clearErrors: () => set({ statusesError: null, subcategoriesError: null, envVariablesError: null, adminUsersError: null }),
      
      reset: () => set({
        statuses: [],
        subcategories: [],
        envVariables: [],
        adminUsers: [],
        isLoadingStatuses: false,
        isLoadingSubcategories: false,
        isLoadingEnvVariables: false,
        isLoadingAdminUsers: false,
        statusesError: null,
        subcategoriesError: null,
        envVariablesError: null,
        adminUsersError: null,
        statusesFetchedAt: null,
        subcategoriesFetchedAt: null,
        envVariablesFetchedAt: null,
        adminUsersFetchedAt: null,
      }),
    }),
    {
      name: 'system-storage',
      partialize: (state) => ({
        statuses: state.statuses,
        subcategories: state.subcategories,
        envVariables: state.envVariables,
        adminUsers: state.adminUsers,
        statusesFetchedAt: state.statusesFetchedAt,
        subcategoriesFetchedAt: state.subcategoriesFetchedAt,
        envVariablesFetchedAt: state.envVariablesFetchedAt,
        adminUsersFetchedAt: state.adminUsersFetchedAt,
      }),
    }
  )
);

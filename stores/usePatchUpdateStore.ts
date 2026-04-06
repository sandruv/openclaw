import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  patchUpdateService, 
  PatchUpdate, 
  CreatePatchUpdateData, 
  UpdatePatchUpdateData,
  PatchUpdateListParams,
  PatchUpdateListResponse,
  UnreadPatchUpdatesResponse
} from '@/services/patchUpdateService';
import { getErrorMessage } from '@/lib/utils';

interface PatchUpdateState {
  // Data
  patchUpdates: PatchUpdate[];
  unreadUpdates: PatchUpdate[];
  currentUpdate: PatchUpdate | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Dialog state
  isOpen: boolean;
  hasShownOnMount: boolean;
  
  // Loading states
  loading: boolean;
  unreadLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  markReadLoading: boolean;
  
  // Error states
  error: string | null;
  unreadError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  markReadError: string | null;
}

interface PatchUpdateActions {
  // Fetch actions
  fetchPatchUpdates: (params?: PatchUpdateListParams) => Promise<void>;
  fetchUnreadUpdates: (priority?: string) => Promise<void>;
  fetchPatchUpdateById: (id: number) => Promise<void>;
  
  // CRUD actions
  createPatchUpdate: (data: CreatePatchUpdateData) => Promise<PatchUpdate | null>;
  updatePatchUpdate: (id: number, data: UpdatePatchUpdateData) => Promise<PatchUpdate | null>;
  deletePatchUpdate: (id: number) => Promise<boolean>;
  
  // Read tracking actions
  markAsRead: (id: number) => Promise<boolean>;
  markAsUnread: (id: number) => Promise<boolean>;
  markAllAsRead: (patchUpdateIds?: number[]) => Promise<boolean>;
  
  // Dialog actions
  openDialog: () => void;
  closeDialog: () => void;
  initializeDialog: () => Promise<void>;
  
  // State management
  setCurrentUpdate: (update: PatchUpdate | null) => void;
  clearErrors: () => void;
  clearCurrentUpdate: () => void;
  
  // Helper actions
  refreshUnreadCount: () => Promise<void>;
  updateLocalPatchUpdate: (id: number, updates: Partial<PatchUpdate>) => void;
  removeLocalPatchUpdate: (id: number) => void;
}

type PatchUpdateStore = PatchUpdateState & PatchUpdateActions;

const initialState: PatchUpdateState = {
  patchUpdates: [],
  unreadUpdates: [],
  currentUpdate: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isOpen: false,
  hasShownOnMount: false,
  loading: false,
  unreadLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  markReadLoading: false,
  error: null,
  unreadError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  markReadError: null,
};

export const usePatchUpdateStore = create<PatchUpdateStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Fetch all patch updates with pagination and filters
      fetchPatchUpdates: async (params?: PatchUpdateListParams) => {
        set({ loading: true, error: null });
        try {
          const response = await patchUpdateService.getAllPatchUpdates(params);
          set({
            patchUpdates: response.data.patchUpdates,
            pagination: response.data.pagination,
            loading: false,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error fetching patch updates:', error);
          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      // Fetch unread patch updates
      fetchUnreadUpdates: async (priority?: string) => {
        set({ unreadLoading: true, unreadError: null });
        try {
          const response = await patchUpdateService.getUnreadPatchUpdates(priority);
          set({
            unreadUpdates: response.data.unreadUpdates,
            unreadLoading: false,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error fetching unread patch updates:', error);
          set({
            unreadError: errorMessage,
            unreadLoading: false,
          });
        }
      },

      // Fetch specific patch update by ID
      fetchPatchUpdateById: async (id: number) => {
        set({ loading: true, error: null });
        try {
          const response = await patchUpdateService.getPatchUpdateById(id);
          set({
            currentUpdate: response.data,
            loading: false,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error fetching patch update:', error);
          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      // Create new patch update
      createPatchUpdate: async (data: CreatePatchUpdateData) => {
        set({ createLoading: true, createError: null });
        try {
          const response = await patchUpdateService.createPatchUpdate(data);
          const newPatchUpdate = response.data;
          
          // Add to local state if published
          if (newPatchUpdate.published) {
            set(state => ({
              patchUpdates: [newPatchUpdate, ...state.patchUpdates],
              createLoading: false,
            }));
          } else {
            set({ createLoading: false });
          }
          
          return newPatchUpdate;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error creating patch update:', error);
          set({
            createError: errorMessage,
            createLoading: false,
          });
          return null;
        }
      },

      // Update patch update
      updatePatchUpdate: async (id: number, data: UpdatePatchUpdateData) => {
        set({ updateLoading: true, updateError: null });
        try {
          const response = await patchUpdateService.updatePatchUpdate(id, data);
          const updatedPatchUpdate = response.data;
          
          // Update local state
          get().updateLocalPatchUpdate(id, updatedPatchUpdate);
          
          set({ updateLoading: false });
          return updatedPatchUpdate;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error updating patch update:', error);
          set({
            updateError: errorMessage,
            updateLoading: false,
          });
          return null;
        }
      },

      // Delete patch update
      deletePatchUpdate: async (id: number) => {
        set({ deleteLoading: true, deleteError: null });
        try {
          await patchUpdateService.deletePatchUpdate(id);
          
          // Remove from local state
          get().removeLocalPatchUpdate(id);
          
          set({ deleteLoading: false });
          return true;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error deleting patch update:', error);
          set({
            deleteError: errorMessage,
            deleteLoading: false,
          });
          return false;
        }
      },

      // Mark patch update as read
      markAsRead: async (id: number) => {
        set({ markReadLoading: true, markReadError: null });
        try {
          const response = await patchUpdateService.markAsRead(id);
          
          // Update local state
          set(state => ({
            patchUpdates: state.patchUpdates.map(update =>
              update.id === id ? { ...update, isRead: true } : update
            ),
            unreadUpdates: state.unreadUpdates.filter(update => update.id !== id),
            currentUpdate: state.currentUpdate?.id === id 
              ? { ...state.currentUpdate, isRead: true }
              : state.currentUpdate,
            markReadLoading: false,
          }));
          
          return true;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error marking patch update as read:', error);
          set({
            markReadError: errorMessage,
            markReadLoading: false,
          });
          return false;
        }
      },

      // Mark patch update as unread
      markAsUnread: async (id: number) => {
        set({ markReadLoading: true, markReadError: null });
        try {
          await patchUpdateService.markAsUnread(id);
          
          // Update local state
          set(state => ({
            patchUpdates: state.patchUpdates.map(update =>
              update.id === id ? { ...update, isRead: false } : update
            ),
            currentUpdate: state.currentUpdate?.id === id 
              ? { ...state.currentUpdate, isRead: false }
              : state.currentUpdate,
            markReadLoading: false,
          }));
          
          // Refresh unread updates to include this one
          get().fetchUnreadUpdates();
          
          return true;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error marking patch update as unread:', error);
          set({
            markReadError: errorMessage,
            markReadLoading: false,
          });
          return false;
        }
      },

      // Mark all or specific patch updates as read
      markAllAsRead: async (patchUpdateIds?: number[]) => {
        set({ markReadLoading: true, markReadError: null });
        try {
          const response = await patchUpdateService.markAllAsRead(patchUpdateIds);
          const result = response.data;
          
          // Update local state
          const targetIds = patchUpdateIds || get().unreadUpdates.map(u => u.id);
          
          set(state => ({
            patchUpdates: state.patchUpdates.map(update =>
              targetIds.includes(update.id) ? { ...update, isRead: true } : update
            ),
            unreadUpdates: patchUpdateIds 
              ? state.unreadUpdates.filter(update => !patchUpdateIds.includes(update.id))
              : [], // Clear all if no specific IDs provided
            markReadLoading: false,
          }));
          
          return true;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          console.error('Error marking patch updates as read:', error);
          set({
            markReadError: errorMessage,
            markReadLoading: false,
          });
          return false;
        }
      },

      // Set current patch update
      setCurrentUpdate: (update: PatchUpdate | null) => {
        set({ currentUpdate: update });
      },

      // Clear all errors
      clearErrors: () => {
        set({
          error: null,
          unreadError: null,
          createError: null,
          updateError: null,
          deleteError: null,
          markReadError: null,
        });
      },

      // Clear current update
      clearCurrentUpdate: () => {
        set({ currentUpdate: null });
      },

      // Refresh unread count (helper for components)
      refreshUnreadCount: async () => {
        try {
          const response = await patchUpdateService.getUnreadPatchUpdates();
          set({ unreadUpdates: response.data.unreadUpdates });
        } catch (error) {
          console.error('Error refreshing unread count:', error);
        }
      },

      // Update local patch update (helper for optimistic updates)
      updateLocalPatchUpdate: (id: number, updates: Partial<PatchUpdate>) => {
        set(state => ({
          patchUpdates: state.patchUpdates.map(update =>
            update.id === id ? { ...update, ...updates } : update
          ),
          unreadUpdates: state.unreadUpdates.map(update =>
            update.id === id ? { ...update, ...updates } : update
          ),
          currentUpdate: state.currentUpdate?.id === id 
            ? { ...state.currentUpdate, ...updates }
            : state.currentUpdate,
        }));
      },

      // Remove local patch update (helper for optimistic updates)
      removeLocalPatchUpdate: (id: number) => {
        set(state => ({
          patchUpdates: state.patchUpdates.filter(update => update.id !== id),
          unreadUpdates: state.unreadUpdates.filter(update => update.id !== id),
          currentUpdate: state.currentUpdate?.id === id ? null : state.currentUpdate,
        }));
      },

      // Dialog management actions
      openDialog: () => {
        set({ isOpen: true });
      },

      closeDialog: () => {
        set({ isOpen: false });
      },

      // Initialize dialog - fetch unread updates and auto-show if needed
      initializeDialog: async () => {
        const state = get();
        
        // Fetch unread updates first
        await get().fetchUnreadUpdates();
        
        // Auto-show dialog if there are unread updates and hasn't been shown yet
        const updatedState = get();
        if (updatedState.unreadUpdates.length > 0 && !state.hasShownOnMount) {
          console.log('Auto-showing dialog on initialization');
          set({ 
            isOpen: true, 
            hasShownOnMount: true 
          });
        }
      },
    }),
    {
      name: 'patch-update-store',
    }
  )
);

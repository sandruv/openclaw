import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getAllGlobalSettings, 
  setGlobalSetting, 
  GlobalSettingData 
} from '@/services/settingsService';
import { useSocket } from '@/services/socketService';
import { KanbanViewType } from '@/types/kanban';
// Define view mode types
export type TaskViewMode = 'list' | 'kanban';

interface SettingsState {
  // Global settings
  globalSettings: {
    checkUserHasInProgress: boolean;
    validateFormContent: boolean;
    [key: string]: any;
  };
  globalSettingsError: string | null;
  isLoadingGlobalSettings: boolean;
  
  // User form settings (stored in session)
  userFormSettings: {
    skipConfirmationDialogs: boolean;
    autoSaveFormData: boolean;
  };
  
  // UI preferences (client-side only)
  darkMode: boolean;
  compactMode: boolean;
  animationMode: boolean;
  highContrastMode: boolean;
  autoSave: boolean;
  showGuidelines: boolean;
  taskViewMode: TaskViewMode;
  kanbanViewType: KanbanViewType;
  sidebarCollapsed: boolean;
  
  // UI preference actions
  setDarkMode: (value: boolean) => void;
  setCompactMode: (value: boolean) => void;
  setAnimationMode: (value: boolean) => void;
  setHighContrastMode: (value: boolean) => void;
  setAutoSave: (value: boolean) => void;
  setShowGuidelines: (value: boolean) => void;
  setTaskViewMode: (value: TaskViewMode) => void;
  setKanbanViewType: (value: KanbanViewType) => void;
  setSidebarCollapsed: (value: boolean) => void;
  
  // User form settings actions
  setUserFormSettings: (settings: Partial<SettingsState['userFormSettings']>) => void;
  setSkipConfirmationDialogs: (value: boolean) => void;
  setAutoSaveFormData: (value: boolean) => void;
  
  // Global settings actions
  setGlobalSettings: (settings: Partial<SettingsState['globalSettings']>) => void;
  setGlobalSettingsError: (error: string | null) => void;
  clearGlobalSettingsError: () => void;
  setIsLoadingGlobalSettings: (isLoading: boolean) => void;
  
  // API interactions
  fetchGlobalSettings: () => Promise<boolean>;
  updateGlobalSetting: (key: string, value: any) => Promise<boolean>;
  
  // Socket listener setup
  setupSocketListeners: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Default global settings
      globalSettings: {
        checkUserHasInProgress: true,
        validateFormContent: true,
      },
      globalSettingsError: null,
      isLoadingGlobalSettings: false,
      
      // Default user form settings
      userFormSettings: {
        skipConfirmationDialogs: true,
        autoSaveFormData: false,
      },
      
      // Default UI preferences
      darkMode: false,
      compactMode: true,
      animationMode: true,
      highContrastMode: false,
      autoSave: true,
      showGuidelines: false,
      taskViewMode: 'list',
      kanbanViewType: 'status',
      sidebarCollapsed: false,
      
      // UI preference actions
      setDarkMode: (value) => set({ darkMode: value }),
      setCompactMode: (value) => set({ compactMode: value }),
      setAnimationMode: (value) => set({ animationMode: value }),
      setHighContrastMode: (value) => set({ highContrastMode: value }),
      setAutoSave: (value) => set({ autoSave: value }),
      setShowGuidelines: (value) => set({ showGuidelines: value }),
      setTaskViewMode: (value) => set({ taskViewMode: value }),
      setKanbanViewType: (value) => set({ kanbanViewType: value }),
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      
      // User form settings actions
      setUserFormSettings: (settings) => 
        set({ userFormSettings: { ...get().userFormSettings, ...settings } }),
      setSkipConfirmationDialogs: (value) => 
        set({ userFormSettings: { ...get().userFormSettings, skipConfirmationDialogs: value } }),
      setAutoSaveFormData: (value) => 
        set({ userFormSettings: { ...get().userFormSettings, autoSaveFormData: value } }),
      
      // Global settings actions
      setGlobalSettings: (settings) => 
        set({ globalSettings: { ...get().globalSettings, ...settings } }),
      setGlobalSettingsError: (error) =>
        set({ globalSettingsError: error }),
      clearGlobalSettingsError: () =>
        set({ globalSettingsError: null }),
      setIsLoadingGlobalSettings: (isLoading) =>
        set({ isLoadingGlobalSettings: isLoading }),
      
      // API interactions
      fetchGlobalSettings: async () => {
        try {
          set({ isLoadingGlobalSettings: true, globalSettingsError: null });
          const response = await getAllGlobalSettings();

          if (!response.data || Object.keys(response.data).length === 0) {
            throw new Error('Failed to fetch global settings: Empty data');
          }
          
          if (response.status === 200 && response.data) {
            const settings = response.data;
            
            // Convert string values to appropriate types
            const typedSettings: Record<string, any> = {};
            
            for (const [key, value] of Object.entries(settings)) {
              // Convert 'true'/'false' strings to boolean
              if (value === 'true' || value === 'false') {
                typedSettings[key] = value === 'true';
              } 
              // Try to convert numeric strings to numbers
              else if (!isNaN(Number(value)) && value !== '') {
                typedSettings[key] = Number(value);
              } 
              // Keep other values as strings
              else {
                typedSettings[key] = value;
              }
            }
            
            set({ 
              globalSettings: { ...get().globalSettings, ...typedSettings },
              isLoadingGlobalSettings: false,
              globalSettingsError: null
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error fetching global settings:', error);
          set({ 
            isLoadingGlobalSettings: false, 
            globalSettingsError: error instanceof Error ? error.message : 'Unknown error occurred'
          });
          return false;
        }
      },
      
      updateGlobalSetting: async (key, value) => {
        try {
          set({ globalSettingsError: null });
          const response = await setGlobalSetting({
            key,
            value: typeof value === 'boolean' || typeof value === 'number' 
              ? String(value) 
              : value,
          });
          
          if (response.status === 200) {
            // Update local state
            set({
              globalSettings: {
                ...get().globalSettings,
                [key]: value
              },
              globalSettingsError: null
            });
            return true;
          }
          throw new Error(`Failed to update setting: ${response.message || 'Unknown error'}`);
        } catch (error) {
          console.error(`Error updating global setting ${key}:`, error);
          set({ 
            globalSettingsError: error instanceof Error 
              ? `Failed to update ${key}: ${error.message}` 
              : `Failed to update ${key}: Unknown error`
          });
          return false;
        }
      },
      
      // Setup socket listeners for real-time updates
      setupSocketListeners: () => {
        const { socket } = useSocket();
        
        if (!socket) return;
        
        // Listen for global settings updates
        socket.on('settings:update', (data: { key: string; value: string }) => {
          const { key, value } = data;
          
          // Convert value to appropriate type
          let typedValue: any = value;
          
          if (value === 'true' || value === 'false') {
            typedValue = value === 'true';
          } else if (!isNaN(Number(value)) && value !== '') {
            typedValue = Number(value);
          }
          
          // Update local state
          set({
            globalSettings: {
              ...get().globalSettings,
              [key]: typedValue
            }
          });
        });
      }
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        compactMode: state.compactMode,
        animationMode: state.animationMode,
        highContrastMode: state.highContrastMode,
        autoSave: state.autoSave,
        showGuidelines: state.showGuidelines,
        taskViewMode: state.taskViewMode,
        kanbanViewType: state.kanbanViewType,
        userFormSettings: state.userFormSettings
      })
    }
  )
);

export default useSettingsStore;

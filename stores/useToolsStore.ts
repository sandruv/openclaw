import { create } from 'zustand';
import { Tool } from '@/services/toolService';
import { getAllTools, getToolsByUserId, getToolsByClientId } from '@/services/toolService';

interface ToolsState {
  // Tools data
  companyTools: Tool[];
  personalTools: Tool[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCompanyTools: (clientId: number) => Promise<void>;
  fetchPersonalTools: (userId: number) => Promise<void>;
  fetchAllTools: () => Promise<void>;
  reset: () => void;
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  // Initial state
  companyTools: [],
  personalTools: [],
  isLoading: false,
  error: null,
  
  // Actions
  fetchCompanyTools: async (clientId: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getToolsByClientId(clientId);
      
      if (response.status === 200 && response.data) {
        set({ companyTools: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch company tools' });
      }
    } catch (error) {
      set({ error: 'Error fetching company tools' });
      console.error('Error fetching company tools:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchPersonalTools: async (userId: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getToolsByUserId(userId);
      
      if (response.status === 200 && response.data) {
        set({ personalTools: response.data });
      } else {
        set({ error: response.message || 'Failed to fetch personal tools' });
      }
    } catch (error) {
      set({ error: 'Error fetching personal tools' });
      console.error('Error fetching personal tools:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchAllTools: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getAllTools();
      
      if (response.status === 200 && response.data) {
        // Split tools into company and personal based on whether they have user_id or client_id
        const companyTools = response.data.filter((tool: Tool) => tool.client_id && !tool.user_id);
        const personalTools = response.data.filter((tool: Tool) => tool.user_id);
        
        set({ companyTools, personalTools });
      } else {
        set({ error: response.message || 'Failed to fetch tools' });
      }
    } catch (error) {
      set({ error: 'Error fetching tools' });
      console.error('Error fetching tools:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  reset: () => {
    set({
      companyTools: [],
      personalTools: [],
      isLoading: false,
      error: null
    });
  }
}));

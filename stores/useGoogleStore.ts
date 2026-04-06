import { create } from 'zustand';
import { search } from '@/services/googleService';
import { GoogleSearchRequest, GoogleSearchResult } from '@/types/google';
import { logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/utils';

interface GoogleStore {
  query: string;
  search_results: GoogleSearchResult[];
  isLoading: boolean;
  error: string | null;
  generateSearch: (query: string) => Promise<{ items: GoogleSearchResult[]; message?: string; status?: number }>;
  setQuery: (query: string) => void;
}

export const useGoogleStore = create<GoogleStore>((set, get) => ({
  query: '',
  search_results: [],
  isLoading: false,
  error: null,

  setQuery: (query: string) => {
    set({ query, error: null });
  },

  generateSearch: async (query: string) => {
    set({ isLoading: true, error: null, query });
    
    try {
      const request: GoogleSearchRequest = { query };
      const response = await search(request);
      
      if (response.status !== 200 || !response.data) {
        throw new Error(response.message || 'Failed to fetch search results');
      }
      
      set((state) => ({
        search_results: response.data.items,
      }));

      logger.info('Google Search:', { 
        query, 
        totalResults: response.data.searchInformation.formattedTotalResults,
        searchTime: response.data.searchInformation.formattedSearchTime 
      });

      return { items: response.data.items, status: response.status };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logger.error('Google search error:', error);
      return { items: [], message: errorMessage, status: 500 };
    } finally {
      set({ isLoading: false });
    }
  },
}));

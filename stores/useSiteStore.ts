import { create } from 'zustand'
import { Site, CreateSiteData, UpdateSiteData } from '@/types/clients'
import { getSites, createSite, updateSite as updateSiteService } from '@/services/siteService'
import { logger } from '@/lib/logger'

interface SiteStore {
    sites: Site[];
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    fetchSites: (page?: number, limit?: number, search?: string, client_id?: number) => Promise<void>;
    addSite: (site: CreateSiteData) => Promise<void>;
    updateSite: (updates: Partial<Site>) => Promise<void>;
    getSitesByClientId: (client_id: number) => Site[];
}

export const useSiteStore = create<SiteStore>((set, get) => ({
    sites: [],
    isLoading: true,
    isSearching: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    },
    fetchSites: async (page = 1, limit = 10, search = '', client_id?: number) => {
        try {
            // If it's the initial load, set isLoading, otherwise use isSearching for subsequent requests
            if (get().sites.length === 0) {
                set({ isLoading: true, error: null });
            } else {
                set({ isSearching: true, error: null });
            }
            
            const data = await getSites({ page, limit, search, client_id });
            logger.debug('Fetching sites with pagination:', { page, limit, search, client_id });
            
            if (data.status !== 200) {
                throw new Error(data.message);
            }
            
            set({
                sites: data.data.list,
                pagination: data.data.pagination,
                isLoading: false,
                isSearching: false
            });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch sites', 
                isLoading: false,
                isSearching: false
            });
            logger.error('Error fetching sites:', { error });
        }
    },
    addSite: async (site) => {
        try {
            set({ isLoading: true, error: null });
            const newSite = await createSite(site);
            if (newSite.status !== 200) {
                throw new Error(newSite.message);
            }
            set(state => ({
                sites: [...state.sites, newSite.data],
                isLoading: false,
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add site', isLoading: false });
            logger.error('Error adding site:', { error, site });
        }
    },
    updateSite: async (data) => {
        try {
            set({ isLoading: true, error: null });
            const updatedSite = await updateSiteService(data);
            logger.info('Updated site:', updatedSite);
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update site', isLoading: false });
            logger.error('Error updating site:', { error, data });
            throw error;
        }
    },
    getSitesByClientId: (client_id) => {
        return get().sites.filter(site => site.client_id === client_id);
    }
}))

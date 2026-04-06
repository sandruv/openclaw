import { create } from 'zustand'
import { ApiResponse, Client, CreateClientData, UpdateClientData } from '@/types/clients'
import { ClientService } from '@/services/clientService'
import { getTasks } from '@/services/taskService'
import { Task } from '@/types/tasks'
import { logger } from '@/lib/logger';

interface PaginationState {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
}

interface ClientStore {
    clients: Client[];
    client: Client | null;
    pagination: PaginationState;
    isInitialLoading: boolean;
    isLoading: boolean;
    isFetchingClient: boolean;
    error: string | null;
    // Client tasks state
    clientTasks: Task[];
    tasksPagination: PaginationState;
    isLoadingTasks: boolean;
    tasksError: string | null;
    // Client methods
    fetchClients: (page?: number, limit?: number, search?: string) => Promise<void>;
    getClientById: (id: number) => Promise<Client | undefined>;
    searchClients: (query: string) => Promise<void>;
    // Client tasks methods
    fetchClientTasks: (clientId: number, page?: number, limit?: number, search?: string) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set, get) => ({
    clients: [],
    client: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
    },
    isInitialLoading: true,
    isFetchingClient: false,
    isLoading: false,
    error: null,
    // Client tasks state
    clientTasks: [],
    tasksPagination: {
        total: 0,
        page: 1,
        limit: 15,
        totalPages: 1,
    },
    isLoadingTasks: false,
    tasksError: null,
    fetchClients: async (page = 1, limit = 10, search = '') => {
        try {
            set({ isLoading: true, error: null });
            const response = await ClientService.getClients({
                page,
                limit,
                search
            });
            
            if (response.status !== 200) {
                throw new Error(response.message);
            }
            
            // Update with new API structure (data.list and data.pagination)
            set({ 
                clients: response.data.list, 
                pagination: response.data.pagination,
                isLoading: false,
                isInitialLoading: false 
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch clients', isLoading: false });
            logger.error('Error fetching clients:', error);
        }
    },
    getClientById: async (id) => {
        try {
            set({ isFetchingClient: true, error: null });
            const response = await ClientService.getClient(id);
            
            if (response.status !== 200) {
                throw new Error(response.message);
            }
            
            set({ client: response.data, isFetchingClient: false });
            
            return response.data;
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Failed to fetch client', 
                isFetchingClient: false 
            });
            logger.error('Error fetching client:', error);
            return undefined;
        }
    },
    searchClients: async (query) => {
        // Use the fetchClients method with the search parameter
        await get().fetchClients(1, 10, query);
    },
    fetchClientTasks: async (clientId, page = 1, limit = 15, search = '') => {
        try {
            set({ isLoadingTasks: true, tasksError: null });
            
            const response = await getTasks({
                page,
                limit,
                search: search || undefined,
                filters: {
                    client: clientId.toString()
                }
            });
            
            if (response.status !== 200) {
                throw new Error(response.message || 'Failed to fetch tasks');
            }
            
            set({ 
                clientTasks: response.data || [],
                tasksPagination: response.pagination || {
                    total: 0,
                    page: 1,
                    limit: 15,
                    totalPages: 1,
                },
                isLoadingTasks: false
            });
        } catch (error) {
            set({ 
                tasksError: error instanceof Error ? error.message : 'Failed to fetch client tasks',
                isLoadingTasks: false 
            });
            logger.error('Error fetching client tasks:', error);
        }
    }
}));

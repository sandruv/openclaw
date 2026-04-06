import { create } from 'zustand'
import { ComboboxOption } from '@/components/ui/combobox'
import { dropdownService } from '@/services/dropdownService'
import { logger } from '@/lib/logger'
import { Client, Site } from '@/types/clients'
import { dropdownCache } from '@/lib/cache/dropdownCache'

type DropdownStore = {
  clients: ComboboxOption[]
  users: ComboboxOption[]
  agents: ComboboxOption[]
  sites: ComboboxOption[]
  ticketTypes: ComboboxOption[]
  priorities: ComboboxOption[]
  impacts: ComboboxOption[]
  urgencies: ComboboxOption[]
  categories: ComboboxOption[]
  subcategories: ComboboxOption[]
  requestSubcategories: ComboboxOption[]
  ticketSources: ComboboxOption[]
  statuses: ComboboxOption[]
  roles: ComboboxOption[]
  isLoading: boolean
  isSearchingClients: boolean
  isSearchingUsers: boolean
  isSearchingAgents: boolean
  error: string | null
  fetchClients: (search?: string) => Promise<void>
  searchClients: (search: string) => Promise<void>
  fetchUsers: (client_id?: string) => Promise<void>
  searchUsers: (search: string, client_id?: string) => Promise<void>
  fetchAgents: () => Promise<void>
  searchAgents: (search: string) => Promise<void>
  fetchSites: (client_id?: string) => Promise<void>
  fetchTicketTypes: () => Promise<void>
  fetchPriorities: () => Promise<void>
  fetchImpacts: () => Promise<void>
  fetchUrgencies: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchSubcategories: () => Promise<void>
  fetchRequestSubcategories: (categoryId: number) => Promise<void>
  fetchTicketSources: () => Promise<void>
  fetchStatuses: () => Promise<void>
  fetchRoles: () => Promise<void>
  fetchAllDropdowns: () => Promise<void>
  setDropdownData: (key: keyof Omit<DropdownStore, 'setDropdownData' | 'isLoading' | 'error' | 'fetchClients' | 'fetchUsers' | 'fetchSites' | 'fetchTicketTypes' | 'fetchPriorities' | 'fetchImpacts' | 'fetchUrgencies' | 'fetchCategories' | 'fetchSubcategories' | 'fetchRequestSubcategories' | 'fetchTicketSources' | 'fetchAllDropdowns' | 'invalidateCache' | 'clearAllCache' | 'getCacheStats'>, data: ComboboxOption[]) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  invalidateCache: (type: string, clientId?: string) => void
  clearAllCache: () => void
  getCacheStats: () => Record<string, any>
}

type User = {
  id: number
  first_name: string
  last_name: string
}

export const useDropdownStore = create<DropdownStore>((set, get) => ({
  clients: [],
  users: [],
  agents: [],
  isSearchingClients: false,
  isSearchingUsers: false,
  isSearchingAgents: false,
  sites: [],
  ticketTypes: [],
  priorities: [],
  impacts: [],
  urgencies: [],
  categories: [],
  subcategories: [],
  requestSubcategories: [],
  ticketSources: [],
  statuses: [],
  roles: [],
  isLoading: false,
  error: null,
  
  fetchClients: async (search?: string) => {
    try {
      // Check cache first
      const cachedClients = dropdownCache.get('clients', search);
      if (cachedClients) {
        logger.debug('Using cached clients data');
        set({ clients: cachedClients });
        return;
      }

      // Check if there's already a pending request for the same data
      const pendingRequest = dropdownCache.getPendingRequest('clients', search);
      if (pendingRequest) {
        logger.debug('Using pending clients request');
        const clients = await pendingRequest;
        set({ clients });
        return;
      }

      set({ isLoading: true, error: null });
      
      // Create and track the API request promise
      const requestPromise = dropdownService.getClients(search).then(response => {
        if (response.status !== 200) {
          throw new Error(response.message);
        }
        
        // Handle both old and new API response structures
        let clientList: Client[];
        if (Array.isArray(response.data)) {
          // Old structure where response.data is directly the Client array
          clientList = response.data;
        } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
          // New structure with { list: Client[], pagination: any }
          clientList = (response.data as any).list;
        } else {
          // Fallback
          clientList = [];
          console.error('Unexpected API response structure:', response.data);
        }
        
        // Transform client data to combobox options
        const clients: ComboboxOption[] = clientList.map(client => ({
          value: String(client.id),
          label: client.name
        }));
        
        // Cache the result
        dropdownCache.set('clients', clients, search);
        
        return clients;
      });

      // Track the pending request
      dropdownCache.setPendingRequest('clients', requestPromise, search);
      
      const clients = await requestPromise;
      set({ clients, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch clients', isLoading: false });
      logger.error('Error fetching clients:', error);
    }
  },
  
  searchClients: async (search: string) => {
    try {
      // Check cache first
      const cachedClients = dropdownCache.get('clients', search);
      if (cachedClients) {
        logger.debug('Using cached search clients data');
        set({ clients: cachedClients });
        return;
      }

      // Only show loading state for search, not the whole UI
      set({ isSearchingClients: true, error: null });
      
      // Reuse fetchClients logic but set isSearchingClients instead of isLoading
      const response = await dropdownService.getClients(search);
      if (response.status !== 200) {
        throw new Error(response.message);
      }
      
      // Handle both old and new API response structures
      let clientsData: Client[];
      if (Array.isArray(response.data)) {
        // Old structure where response.data is directly the Client array
        clientsData = response.data;
      } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
        // New structure with { list: Client[], pagination: any }
        clientsData = (response.data as any).list;
      } else {
        // Fallback
        clientsData = [];
        console.error('Unexpected API response structure:', response.data);
      }
      
      // Transform client data to combobox options
      const clients: ComboboxOption[] = clientsData.map(client => ({
        value: String(client.id),
        label: client.name
      }));

      // Cache the result
      dropdownCache.set('clients', clients, search);
      
      set({ clients, isSearchingClients: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to search clients', isSearchingClients: false });
      logger.error('Error searching clients:', error);
    }
  },
  
  fetchUsers: async (client_id?: string) => {
    try {
      // Check cache first
      const cachedUsers = dropdownCache.get('users', undefined, client_id);
      if (cachedUsers) {
        logger.debug('Using cached users data');
        set({ users: cachedUsers });
        return;
      }

      // Check if there's already a pending request for users
      const pendingRequest = dropdownCache.getPendingRequest('users', undefined, client_id);
      if (pendingRequest) {
        logger.debug('Using pending users request');
        const users = await pendingRequest;
        set({ users });
        return;
      }

      set({ isLoading: true, error: null })
      
      // Create and track the API request promise
      const requestPromise = dropdownService.getUsers(undefined, client_id).then(response => {
        if (response.status === 200) {
          // Handle paginated response structure
          let usersData: User[]
          if (Array.isArray(response.data)) {
            // Old structure
            usersData = response.data as User[]
          } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
            // New structure with pagination
            usersData = (response.data as any).list
          } else {
            // Fallback
            usersData = []
            console.error('Unexpected API response structure:', response.data)
          }
          
          const transformedUsers = usersData.map((user: User) => ({
            value: user.id+"",
            label: (user.first_name + " " + user.last_name) || ''
          }))
          
          // Cache only users data - agents have their own separate cache (always client_id=1)
          dropdownCache.set('users', transformedUsers, undefined, client_id);
          
          return transformedUsers;
        }
        throw new Error('Failed to fetch users');
      });

      // Track the pending request for users only
      dropdownCache.setPendingRequest('users', requestPromise, undefined, client_id);
      
      const users = await requestPromise;
      set({ users, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch users:', error)
      set({ error: 'Failed to fetch users', isLoading: false })
    }
  },
  
  searchUsers: async (search: string, client_id?: string) => {
    try {
      // Check cache first
      const cachedUsers = dropdownCache.get('users', search, client_id);
      if (cachedUsers) {
        logger.debug('Using cached search users data');
        set({ users: cachedUsers });
        return;
      }

      // Only show loading state for search, not the whole UI
      set({ isSearchingUsers: true, error: null })
      
      const response = await dropdownService.getUsers(undefined, client_id, search)
      if (response.status === 200) {
        // Handle paginated response structure
        let usersData: User[]
        if (Array.isArray(response.data)) {
          // Old structure
          usersData = response.data as User[]
        } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
          // New structure with pagination
          usersData = (response.data as any).list
        } else {
          // Fallback
          usersData = []
          console.error('Unexpected API response structure:', response.data)
        }
        
        const transformedUsers = usersData.map((user: User) => ({
          value: user.id+"",
          label: (user.first_name + " " + user.last_name) || ''
        }))
        
        // Cache the result
        dropdownCache.set('users', transformedUsers, search, client_id);
        
        set({ users: transformedUsers, isSearchingUsers: false })
      }
    } catch (error) {
      console.error('Failed to search users:', error)
      set({ error: 'Failed to search users', isSearchingUsers: false })
    }
  },
  
  fetchAgents: async () => {
    try {
      // Check cache first (agents are always client_id=1, so no need for client_id parameter)
      const cachedAgents = dropdownCache.get('agents');
      if (cachedAgents) {
        logger.debug('Using cached agents data');
        set({ agents: cachedAgents });
        return;
      }

      // Check if there's already a pending request for agents
      const pendingRequest = dropdownCache.getPendingRequest('agents');
      if (pendingRequest) {
        logger.debug('Using pending agents request');
        const agents = await pendingRequest;
        set({ agents });
        return;
      }

      set({ isLoading: true, error: null })
      
      // Create and track the API request promise using the new getAgents method
      const requestPromise = dropdownService.getAgents().then(response => {
        if (response.status === 200) {
          // Handle paginated response structure
          let usersData: User[]
          if (Array.isArray(response.data)) {
            // Old structure
            usersData = response.data as User[]
          } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
            // New structure with pagination
            usersData = (response.data as any).list
          } else {
            // Fallback
            usersData = []
            console.error('Unexpected API response structure:', response.data)
          }
          
          // Filter out users with null first_name or last_name and transform to combobox options
          const transformedAgents = usersData
            .filter(user => user.first_name !== null && user.last_name !== null)
            .map((user: User) => ({
              value: user.id+"",
              label: (user.first_name + " " + user.last_name) || ''
            }))
          
          // Cache the result
          dropdownCache.set('agents', transformedAgents);
          
          return transformedAgents;
        }
        throw new Error('Failed to fetch agents');
      });

      // Track the pending request
      dropdownCache.setPendingRequest('agents', requestPromise);
      
      const agents = await requestPromise;
      set({ agents, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch agents:', error)
      set({ error: 'Failed to fetch agents', isLoading: false })
    }
  },
  
  searchAgents: async (search: string) => {
    // This method is kept for backward compatibility but does nothing
    // Since we now use Combobox with built-in client-side filtering,
    // we don't need to modify the store during search
    // The agents array should remain unchanged so filtering works correctly
    try {
      // Ensure agents are loaded if not already
      const currentAgents = get().agents;
      if (currentAgents.length === 0) {
        await get().fetchAgents();
      }
      // Don't modify the agents array - let Combobox handle filtering
    } catch (error) {
      console.error('Failed to load agents:', error);
      set({ error: 'Failed to load agents' });
    }
  },
  
  fetchSites: async (client_id?: string) => {
    try {
      // Check cache first
      const cachedSites = dropdownCache.get('sites', undefined, client_id);
      if (cachedSites) {
        logger.debug('Using cached sites data');
        set({ sites: cachedSites });
        return;
      }

      // Check if there's already a pending request for the same data
      const pendingRequest = dropdownCache.getPendingRequest('sites', undefined, client_id);
      if (pendingRequest) {
        logger.debug('Using pending sites request');
        const sites = await pendingRequest;
        set({ sites });
        return;
      }

      // Create and track the API request promise
      const requestPromise = dropdownService.getSites(client_id).then(response => {
        if (response.status === 200) {
          // Handle both old and new API response structures
          let sitesData: Site[];
          if (Array.isArray(response.data)) {
            // Old structure where response.data is directly the Client array
            sitesData = response.data;
          } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
            // New structure with { list: Client[], pagination: any }
            sitesData = (response.data as any).list;
          } else {
            // Fallback
            sitesData = [];
          }

          const transformedSites = sitesData.map((site: Site) => ({
            value: site.id+"",
            label: site.name || ''
          }))
          
          // Cache the result
          dropdownCache.set('sites', transformedSites, undefined, client_id);
          
          return transformedSites;
        }
        throw new Error('Failed to fetch sites');
      });

      // Track the pending request
      dropdownCache.setPendingRequest('sites', requestPromise, undefined, client_id);
      
      const sites = await requestPromise;
      set({ sites });
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
  
  fetchTicketTypes: async () => {
    try {
      // Check cache first
      const cachedTypes = dropdownCache.get('ticketTypes');
      if (cachedTypes) {
        logger.debug('Using cached ticket types data');
        set({ ticketTypes: cachedTypes });
        return;
      }

      set({ isLoading: true, error: null })
      const response = await dropdownService.getTicketTypes()
      if (response.status === 200) {
        const transformedTypes = response.data.map(type => ({
          value: type.id+"",
          label: type.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('ticketTypes', transformedTypes);
        
        set({ ticketTypes: transformedTypes })
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  fetchPriorities: async () => {
    try {
      // Check cache first
      const cachedPriorities = dropdownCache.get('priorities');
      if (cachedPriorities) {
        logger.debug('Using cached priorities data');
        set({ priorities: cachedPriorities });
        return;
      }

      set({ isLoading: true, error: null })
      const response = await dropdownService.getPriorities()
      if (response.status === 200) {
        const transformedPriorities = response.data.map(priority => ({
          value: priority.id+"",
          label: priority.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('priorities', transformedPriorities);
        
        set({ priorities: transformedPriorities })
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  fetchImpacts: async () => {
    try {
      // Check cache first
      const cachedImpacts = dropdownCache.get('impacts');
      if (cachedImpacts) {
        logger.debug('Using cached impacts data');
        set({ impacts: cachedImpacts });
        return;
      }

      set({ isLoading: true, error: null })
      const response = await dropdownService.getImpacts()
      if (response.status === 200) {
        const transformedImpacts = response.data.map(impact => ({
          value: impact.id+"",
          label: impact.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('impacts', transformedImpacts);
        
        set({ impacts: transformedImpacts })
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  fetchUrgencies: async () => {
    try {
      // Check cache first
      const cachedUrgencies = dropdownCache.get('urgencies');
      if (cachedUrgencies) {
        logger.debug('Using cached urgencies data');
        set({ urgencies: cachedUrgencies });
        return;
      }

      set({ isLoading: true, error: null })
      const response = await dropdownService.getUrgencies()
      if (response.status === 200) {
        const transformedUrgencies = response.data.map(urgency => ({
          value: urgency.id+"",
          label: urgency.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('urgencies', transformedUrgencies);
        
        set({ urgencies: transformedUrgencies })
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  fetchCategories: async () => {
    try {
      // Check cache first
      const cachedCategories = dropdownCache.get('categories');
      if (cachedCategories) {
        logger.debug('Using cached categories data');
        set({ categories: cachedCategories });
        return;
      }

      set({ isLoading: true, error: null })
      const response = await dropdownService.getCategories()
      if (response.status === 200) {
        const transformedCategories = response.data.map(category => ({
          value: category.id+"",
          label: category.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('categories', transformedCategories);
        
        set({ categories: transformedCategories })
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  
  fetchSubcategories: async () => {
    try {
      // Check cache first
      const cachedSubcategories = dropdownCache.get('subcategories');
      if (cachedSubcategories) {
        logger.debug('Using cached subcategories data');
        set({ subcategories: cachedSubcategories });
        return;
      }

      set({ isLoading: true, error: null })
      const response = await dropdownService.getSubcategories()
      if (response.status === 200) {
        const transformedSubcategories = response.data.map(subcategory => ({
          value: subcategory.id+"",
          label: subcategory.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('subcategories', transformedSubcategories);
        
        set({ subcategories: transformedSubcategories })
      }
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchRequestSubcategories: async () => {
    try {
      // Check cache first
      const cachedRequestSubcategories = dropdownCache.get('requestSubcategories');
      if (cachedRequestSubcategories) {
        logger.debug('Using cached request subcategories data');
        set({ requestSubcategories: cachedRequestSubcategories });
        return;
      }

      const response = await dropdownService.getSubcategories(7)
      if (response.status === 200) {
        const transformedRequestCategory = response.data.map(subcategory => ({
          value: subcategory.id+"",
          label: subcategory.name || ''
        }))
        
        // Cache the result
        dropdownCache.set('requestSubcategories', transformedRequestCategory);
        
        set({ requestSubcategories: transformedRequestCategory })
      }
      
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
  
  fetchTicketSources: async () => {
    try {
      // Check cache first
      const cachedTicketSources = dropdownCache.get('ticketSources');
      if (cachedTicketSources) {
        logger.debug('Using cached ticket sources data');
        set({ ticketSources: cachedTicketSources });
        return;
      }

      set({ isLoading: true, error: null });
      const response = await dropdownService.getTicketSources();
      const ticketSources = response.data.map(source => ({
        value: source.id.toString(),
        label: source.name
      }));
      
      // Cache the result
      dropdownCache.set('ticketSources', ticketSources);
      
      set({ ticketSources });
    } catch (error) {
      logger.error('Error fetching ticket sources:', error);
      set({ error: 'Failed to fetch ticket sources' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStatuses: async () => {
    try {
      // Check cache first
      const cachedStatuses = dropdownCache.get('statuses');
      if (cachedStatuses) {
        logger.debug('Using cached statuses data');
        set({ statuses: cachedStatuses });
        return;
      }

      // Check if there's already a pending request for the same data
      const pendingRequest = dropdownCache.getPendingRequest('statuses');
      if (pendingRequest) {
        logger.debug('Using pending statuses request');
        const statuses = await pendingRequest;
        set({ statuses });
        return;
      }

      set({ isLoading: true, error: null });
      
      // Create and track the API request promise
      const requestPromise = dropdownService.getStatuses().then(response => {
        // Filter out "Assigned" status (id=8) - it's automatically set on reassignment
        const statuses = response.data
          .filter(status => status.name !== 'Assigned')
          .map(status => ({
            value: status.id.toString(),
            label: status.name
          }));
        
        // Cache the result
        dropdownCache.set('statuses', statuses);
        
        return statuses;
      });

      // Track the pending request
      dropdownCache.setPendingRequest('statuses', requestPromise);
      
      const statuses = await requestPromise;
      set({ statuses });
    } catch (error) {
      logger.error('Error fetching statuses:', error);
      set({ error: 'Failed to fetch statuses' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchRoles: async () => {
    try {
      // Check cache first
      const cachedRoles = dropdownCache.get('roles');
      if (cachedRoles) {
        logger.debug('Using cached roles data');
        set({ roles: cachedRoles });
        return;
      }

      // Check if there's already a pending request for the same data
      const pendingRequest = dropdownCache.getPendingRequest('roles');
      if (pendingRequest) {
        logger.debug('Using pending roles request');
        const roles = await pendingRequest;
        set({ roles });
        return;
      }

      set({ isLoading: true, error: null });
      
      // Create and track the API request promise
      const requestPromise = dropdownService.getRoles().then(response => {
        if (response.status === 200) {
          const transformedRoles = response.data.map(role => ({
            value: role.id.toString(),
            label: role.name
          }));
          
          // Cache the result
          dropdownCache.set('roles', transformedRoles);
          
          return transformedRoles;
        }
        throw new Error('Failed to fetch roles');
      });

      // Track the pending request
      dropdownCache.setPendingRequest('roles', requestPromise);
      
      const roles = await requestPromise;
      set({ roles });
    } catch (error) {
      logger.error('Error fetching roles:', error);
      set({ error: 'Failed to fetch roles' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchAllDropdowns: async () => {
    try {
      set({ isLoading: true, error: null })
      
      // Use existing store methods which include caching and proper error handling
      await Promise.all([
        get().fetchClients(),
        get().fetchUsers(),
        get().fetchAgents(),
        get().fetchSites(),
        get().fetchTicketTypes(),
        get().fetchPriorities(),
        get().fetchImpacts(),
        get().fetchUrgencies(),
        get().fetchCategories(),
        get().fetchSubcategories(),
        get().fetchTicketSources(),
        get().fetchStatuses(),
        get().fetchRoles()
      ])
      
      set({ isLoading: false })
    } catch (error) {
      logger.error('Error fetching all dropdowns:', error);
      set({ error: 'Failed to fetch dropdowns', isLoading: false });
    }
  },
  
  setDropdownData: (key, data) => set((state) => ({ ...state, [key]: data })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  // Cache management methods
  invalidateCache: (type: string, clientId?: string) => {
    dropdownCache.invalidate(type, clientId);
  },
  
  clearAllCache: () => {
    dropdownCache.clear();
  },
  
  getCacheStats: () => {
    return dropdownCache.getStats();
  }
}))

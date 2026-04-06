import { create } from 'zustand'
import { User } from '@/types/clients'
import { getUsers, getUser, createUser, updateUser as updateUserService, validateEmail } from '@/services/userService'
import { logger } from '@/lib/logger'
import { ApiResponse } from '@/types/clients'

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  client_id?: number;
  role_id?: number;
}

interface PaginationState {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface UserStore {
    users: User[];
    user: User | null;
    pagination: PaginationState;
    isFetchingUser: boolean;
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    emailValidationErrors: Record<string, string>;
    isValidatingEmail: boolean;
    fetchUsers: (page?: number, limit?: number, search?: string, client_id?: number, role_id?: number) => Promise<void>;
    getUsersByClientId: (client_id: number) => User[];
    getUser: (id: number) => Promise<User | undefined>;
    addUser: (user: UserInput) => Promise<User | undefined>;
    updateUser: (id: number, updates: Partial<User>) => Promise<ApiResponse<User>>;
    searchUsers: (query: string) => User[];
    getAgents: (search?: string) => Promise<{ label: string; value: string; }[]>;
    validateEmailAsync: (email: string, fieldKey?: string) => Promise<boolean>;
    clearEmailValidationError: (fieldKey?: string) => void;
}

type UserInput = Partial<Omit<User, 'id'>> & { 
    first_name: string,
    last_name: string,
    email: string,
    phone_number?: string,
    role_id: string | number,
    client_id: string | number, 
    address?: string,
    is_user_vip: boolean,
    sophistication_id: number,
    password: string
}

export const useUserStore = create<UserStore>((set, get) => {
    const initializeUsers = async (page = 1, limit = 10, search = '', client_id?: number, role_id?: number) => {
        try {
            set({ isLoading: true, error: null });
            const response = await getUsers({ page, limit, search, client_id, role_id });
            
            if (response.status !== 200) {
                throw new Error(response.message);
            }
            
            set({ 
                users: response.data.list, 
                pagination: response.data.pagination,
                isLoading: false 
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
            set({ 
                users: [], 
                isLoading: false, 
                error: errorMessage 
            });
            logger.error('Failed to fetch users:', errorMessage);
        }
    };

    // Do NOT call initializeUsers() at module level - it causes build-time API calls
    // Components should call fetchUsers() when they mount instead

    return {
        users: [],
        user: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
        },
        isFetchingUser: false,
        isLoading: false,
        isSearching: false,
        error: null,
        emailValidationErrors: {},
        isValidatingEmail: false,
        fetchUsers: async (page = 1, limit = 10, search = '', client_id?: number, role_id?: number) => {
            await initializeUsers(page, limit, search, client_id, role_id);
        },
        getUsersByClientId: (client_id: number) => {
            const users = get().users;
            return users?.filter(user => user.client_id === client_id) ?? [];
        },
        getUser: async (id: number) => {
            try {
                set({ isFetchingUser: true, error: null });
                const response = await getUser(id);
                set({ user: response.data, isFetchingUser: false });
                return response.data;
            } catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to fetch user', isFetchingUser: false });
                return undefined;
            }
        },
        addUser: async (user) => {
            try {
                set({ isLoading: true, error: null });
                const response = await createUser({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    address: user.address || '',
                    phone_number: user.phone_number || '',
                    client_id: Number(user.client_id),
                    role_id: Number(user.role_id),
                    email: user.email || '',
                    is_user_vip: user.is_user_vip || false,
                    sophistication_id: user.sophistication_id || 1,
                    password: '123456'
                });

                logger.info('New user added:', response.data);
                
                set(state => ({
                    users: [...state.users, response.data],
                    isLoading: false,
                }));
                return response.data
            } catch (error) {
                set({ error: error instanceof Error ? error.message : 'Failed to add user', isLoading: false });
            }
        },
        updateUser: async (id, updates) => {
            try {
                set({ isFetchingUser: true, error: null });
                const response = await updateUserService({ id, ...updates });

                logger.info('Updated user:', response);
                set({ isFetchingUser: false });
                return response;
            } catch (error) {
                logger.error('Error updating user:', error);
                set({ error: error instanceof Error ? error.message : 'Failed to update user', isFetchingUser: false });
                throw error;
            }
        },
        searchUsers: (query: string) => {
            const users = get().users;
            return users.filter(user => 
                user.first_name.toLowerCase().includes(query.toLowerCase()) ||
                user.last_name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
            );
        },
        getAgents: async (search?: string) => {
            try {
                set({ isLoading: true, error: null });
                const response = await getUsers({ client_id: 1, search }); // Directly fetch agents with client_id=1
                
                if (response.status !== 200) {
                    throw new Error(response.message);
                }
                
                // Filter out users with null first_name or last_name
                const validUsers = response.data.list.filter(user => 
                    user.first_name !== null && 
                    user.last_name !== null
                );
                
                // Return formatted data for Combobox
                return validUsers.map(user => ({
                    label: `${user.first_name} ${user.last_name}`,
                    value: user.id.toString()
                }));
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch agents';
                logger.error('Failed to fetch agents:', errorMessage);
                set({ error: errorMessage });
                return []; // Return empty array on error
            } finally {
                set({ isLoading: false });
            }
        },
        validateEmailAsync: async (email: string, fieldKey: string = 'email') => {
            if (!email || !email.trim()) {
                set(state => ({
                    emailValidationErrors: {
                        ...state.emailValidationErrors,
                        [fieldKey]: ''
                    }
                }));
                return true;
            }

            // Basic email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                set(state => ({
                    emailValidationErrors: {
                        ...state.emailValidationErrors,
                        [fieldKey]: 'Invalid email format'
                    }
                }));
                return false;
            }

            try {
                set({ isValidatingEmail: true });
                const result = await validateEmail(email.trim());
                
                if (result.exists && result.user) {
                    const errorMessage = `Email already exists!`;
                    
                    set(state => ({
                        emailValidationErrors: {
                            ...state.emailValidationErrors,
                            [fieldKey]: errorMessage
                        },
                        isValidatingEmail: false
                    }));
                    return false;
                } else {
                    // Email is available
                    set(state => ({
                        emailValidationErrors: {
                            ...state.emailValidationErrors,
                            [fieldKey]: ''
                        },
                        isValidatingEmail: false
                    }));
                    return true;
                }
            } catch (error) {
                logger.error('Email validation error:', error);
                // Don't block submission if API fails
                set(state => ({
                    emailValidationErrors: {
                        ...state.emailValidationErrors,
                        [fieldKey]: ''
                    },
                    isValidatingEmail: false
                }));
                return true;
            }
        },
        clearEmailValidationError: (fieldKey: string = 'email') => {
            set(state => ({
                emailValidationErrors: {
                    ...state.emailValidationErrors,
                    [fieldKey]: ''
                }
            }));
        }
    }
})

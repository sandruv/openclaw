import { ComboboxOption } from '@/components/ui/combobox';
import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '@/types/api';
import { Client, User, Site } from '@/types/clients';
import { TaskType, Priority, Impact, Urgency, Category, TaskSource, Subcategory } from "@/types/newTask"
import { Status } from '@/types/tasks';

export interface DropdownResponse {
  clients: Client[];
  users: User[];
  sites: Site[];
  ticketTypes: ComboboxOption[];
  priorities: ComboboxOption[];
  impacts: ComboboxOption[];
  urgencies: ComboboxOption[];
  categories: ComboboxOption[];
  subcategories: ComboboxOption[];
  ticketSources: ComboboxOption[];
  roles: ComboboxOption[];
}

export type DropdownData = DropdownResponse;

declare global {
  interface Window {
    __INITIAL_DROPDOWN_DATA__?: DropdownResponse;
  }
}

class DropdownService {
  // Get specific dropdown data
  async getClients(search?: string, limit: number = 10): Promise<ApiResponse<Client[]>> {
    let endpoint = '/clients';
    
    // Add search and limit parameters if provided
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (limit) params.push(`limit=${limit}`);
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    const response = await apiRequest<ApiResponse<Client[]>>(endpoint);
    return response;
  }

  async getUsers(id?: number, client_id?: string, search?: string): Promise<ApiResponse<User[] | User>> {
    let endpoint = '/users';
    
    // Build query parameters
    const params = [];
    if (id) params.push(`id=${id}`);
    if (client_id) params.push(`client_id=${client_id}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    
    // Add minimal=true for dropdown queries to prevent loading expensive relations
    if (!id) { // Only for list queries, not single user lookups
      params.push('minimal=true');
    }
    
    // Add query parameters to endpoint
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    const response = await apiRequest<ApiResponse<User[] | User>>(endpoint);
    return response;
  }

  async getAgents(): Promise<ApiResponse<User[]>> {
    // Fetch all agents (users with client_id=1) in one request
    // Using minimal=true to skip expensive relations (tickets, activities) that cause memory leaks
    const endpoint = '/users?client_id=1&limit=200&minimal=true';
    const response = await apiRequest<ApiResponse<User[]>>(endpoint);
    return response;
  }

  async getSites(client_id?: string): Promise<ApiResponse<Site[]>> {
    const endpoint = client_id ? `/sites?client_id=${client_id}` : '/sites';
    const response = await apiRequest<ApiResponse<Site[]>>(endpoint);
    return response;
  }

  async getTicketTypes(): Promise<ApiResponse<TaskType[]>> {
    const response = await apiRequest<ApiResponse<TaskType[]>>('/tickettypes');
    return response;
  }

  async getStatuses(): Promise<ApiResponse<Status[]>> {
    const response = await apiRequest<ApiResponse<Status[]>>('/statuses');
    return response;
  }

  async getPriorities(): Promise<ApiResponse<Priority[]>> {
    const response = await apiRequest<ApiResponse<Priority[]>>('/priorities');
    return response;
  }

  async getImpacts(): Promise<ApiResponse<Impact[]>> {
    const response = await apiRequest<ApiResponse<Impact[]>>('/impacts');
    return response;
  }

  async getUrgencies(): Promise<ApiResponse<Urgency[]>> {
    const response = await apiRequest<ApiResponse<Urgency[]>>('/urgencies');
    return response;
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await apiRequest<ApiResponse<Category[]>>('/categories');
    return response;
  }

  async getSubcategories(categoryId?: number): Promise<ApiResponse<Subcategory[]>> {
    const response = await apiRequest<ApiResponse<Subcategory[]>>(
      categoryId ? `/subcategories?category_id=${categoryId}` : '/subcategories'
    );
    return response;
  }

  async getTicketSources(): Promise<ApiResponse<TaskSource[]>> {
    const response = await apiRequest<ApiResponse<TaskSource[]>>('/ticketsources');
    return response;
  }
  
  async getRoles(): Promise<ApiResponse<{id: number, name: string}[]>> {
    const response = await apiRequest<ApiResponse<{id: number, name: string}[]>>('/roles');
    return response;
  }

  async getAllDropdownData(): Promise<DropdownResponse> {
    const [
      clientsRes,
      usersRes,
      sitesRes,
      ticketTypesRes,
      prioritiesRes,
      impactsRes,
      urgenciesRes,
      categoriesRes,
      subcategoriesRes,
      ticketSourcesRes,
      rolesRes
    ] = await Promise.all([
      this.getClients(),
      this.getUsers(),
      this.getSites(),
      this.getTicketTypes(),
      this.getPriorities(),
      this.getImpacts(),
      this.getUrgencies(),
      this.getCategories(),
      this.getSubcategories(),
      this.getTicketSources(),
      this.getRoles()
    ]);

    return {
      clients: clientsRes.data,
      users: usersRes.data as User[],
      sites: sitesRes.data,
      ticketTypes: ticketTypesRes.data.map(type => ({ value: type.id.toString(), label: type.name })),
      priorities: prioritiesRes.data.map(priority => ({ value: priority.id.toString(), label: priority.name })),
      impacts: impactsRes.data.map(impact => ({ value: impact.id.toString(), label: impact.name })),
      urgencies: urgenciesRes.data.map(urgency => ({ value: urgency.id.toString(), label: urgency.name })),
      categories: categoriesRes.data.map(category => ({ value: category.id.toString(), label: category.name })),
      subcategories: subcategoriesRes.data.map(subcategory => ({ value: subcategory.id.toString(), label: subcategory.name })),
      ticketSources: ticketSourcesRes.data.map(source => ({ value: source.id.toString(), label: source.name })),
      roles: rolesRes.data.map(role => ({ value: role.id.toString(), label: role.name }))
    };
  }
}

export const dropdownService = new DropdownService();

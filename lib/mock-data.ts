import { Client, Role, Site, User } from "@/types/clients";
import { Task } from "@/types/tasks";
import { TaskType, Priority, Impact } from "@/types/newTask";

// Define a Status type that matches what we need for mocking
interface Status {
    id: number;
    name: string;
    updated_at: string;
}

/**
 * Creates a default user object for mock data generation
 * @param clientId The client ID to associate with the user
{{ ... }}
 * @param timestamp ISO timestamp string for created_at and updated_at
 * @returns A complete User object that satisfies the User type
 */
export const createDefaultUser = (clientId: number, timestamp: string): User => {
    return {
        id: Math.floor(Math.random() * 1000) + 1,
        first_name: `User${Math.floor(Math.random() * 100)}`,
        last_name: `Last${Math.floor(Math.random() * 100)}`,
        email: `user${Math.floor(Math.random() * 1000)}@example.com`,
        client_id: clientId,
        role_id: 1,
        client: {
            id: clientId,
            name: `Client ${clientId}`,
            is_client_vip: Math.random() > 0.8,
            phone_number: '123-456-7890',
            email: 'client@example.com',
            status_id: 1,
            status: {
                id: 1,
                name: Math.random() > 0.3 ? 'active' : 'inactive',
                created_at: timestamp,
                updated_at: timestamp
            },
            created_at: timestamp,
            updated_at: timestamp
        },
        role: {
            id: 1,
            name: 'user',
            created_at: timestamp,
            updated_at: timestamp
        },
        created_at: timestamp,
        updated_at: timestamp,
        phone_number: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 9000) + 1000} Main St, Suite ${Math.floor(Math.random() * 900) + 100}`,
        is_user_vip: Math.random() > 0.8
    };
};

/**
 * Generates a specified number of mock tasks for testing virtualization
 * @param count Number of mock tasks to generate
 * @returns Array of Task objects that conform to the Task type
 */
export const generateMockTasks = (count: number): Task[] => {
    const mockTasks: Task[] = [];
    
    // Status names array for better readability
    const statusNames = ['new', 'in progress', 'on hold', 'closed'];
    const typeNames = ['incident', 'request', 'opportunity', 'scheduled task', 'project'];
    const sourceNames = ['email', 'chat', 'call', 'sms', 'principal request'];
    const priorityNames = ['low', 'medium', 'high', 'critical'];
    // Must match ImpactType in taskUtils.ts
    const impactNames = ['single user', 'multiple users', 'company wide'];
    
    for (let i = 1; i <= count; i++) {
        const timestamp = new Date().toISOString();
        const daysAgo = Math.floor(Math.random() * 30); // Random date in the last month
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        // Random IDs
        const statusId = Math.floor(Math.random() * 4) + 1;
        const sourceId = Math.floor(Math.random() * 4) + 1;
        const typeId = Math.floor(Math.random() * 4) + 1;
        const priorityId = Math.floor(Math.random() * 4) + 1;
        const impactId = Math.floor(Math.random() * 3) + 1; // Adjust to match impactNames array length
        const clientId = Math.floor(Math.random() * 10) + 1;
        const assigneeId = Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 1 : null; // Some tasks might not have an assignee
        
        // Closed date only for completed/closed tasks
        const closedDate = (statusId >= 3) ? 
            new Date(Date.now() - Math.floor(Math.random() * daysAgo) * 24 * 60 * 60 * 1000).toISOString() : 
            '';
        
        // Create a site object that matches the expected Site type
        const site: Site = {
            id: Math.floor(Math.random() * 5) + 1,
            name: `Site ${Math.floor(Math.random() * 5) + 1}`,
            client_id: clientId,
            created_at: timestamp,
            updated_at: timestamp,
            status: Math.random() > 0.3 ? 'active' as const : 'inactive' as const,
            address: `123 Main St, Site ${Math.floor(Math.random() * 5) + 1}`,
            phone_number: `555-123-${Math.floor(Math.random() * 9000) + 1000}`
        };

        // Create a user that will be the default user for the task
        const defaultUser = createDefaultUser(clientId, timestamp);

        // Create the task object that matches the Task interface
        mockTasks.push({
            id: i,
            summary: `Task ${i} - Lorem ipsum dolor sit amet. This is a mock task for testing virtualization with large datasets`,
            status: {
                id: statusId,
                name: statusNames[statusId - 1],
                updated_at: timestamp
            },
            ticket_source: {
                id: typeId,
                name: sourceNames[sourceId - 1],
                created_at: timestamp,
                updated_at: timestamp
            },
            ticket_type: {
                id: typeId,
                name: typeNames[typeId - 1],
                created_at: timestamp,
                updated_at: timestamp
            },
            priority: {
                id: priorityId,
                name: priorityNames[priorityId - 1],
                created_at: timestamp,
                updated_at: timestamp
            },
            impact: {
                id: impactId,
                name: impactNames[impactId - 1],
                created_at: timestamp,
                updated_at: timestamp
            },
            client: {
                id: clientId,
                name: `Client ${clientId}`,
                created_at: timestamp,
                updated_at: timestamp,
                is_client_vip: Math.random() > 0.8,
                phone_number: '123-456-7890',
                email: `client${clientId}@example.com`,
                status_id: 1,
                status: {
                    id: 1,
                    name: Math.random() > 0.3 ? 'active' : 'inactive',
                    created_at: timestamp,
                    updated_at: timestamp
                }
            },
            agent: assigneeId ? {
                id: assigneeId,
                first_name: `Agent`,
                last_name: `${assigneeId}`,
                email: `agent${assigneeId}@example.com`,
                created_at: timestamp,
                updated_at: timestamp,
                phone_number: '',
                address: '',
                client_id: clientId,
                role_id: 2,  // Assume role 2 is for agents
                is_user_vip: false,
                client: {
                    id: clientId,
                    name: `Client ${clientId}`,
                    created_at: timestamp,
                    updated_at: timestamp
                },
                role: {
                    id: 2,
                    name: 'Agent',
                    created_at: timestamp,
                    updated_at: timestamp
                }
            } : defaultUser, // Use the default user if no assignee
            user: defaultUser, // User is required by the Task interface
            triager: defaultUser, // Triager is required by the Task interface (person who created the task)
            sites: site, // Sites is required
            activities: [], // Activities array is required
            created_at: createdAt,
            updated_at: timestamp,
            date_closed: closedDate || '',  // Convert null to empty string to avoid type issues
            analysis: null,
            assignee_order: i // Optional field
        });
    }
    
    return mockTasks;
}

/**
 * Mock function to simulate an API call that fetches tasks with pagination
 * @param page The page number to fetch (1-based)
 * @param limit The number of tasks per page
 * @param filters Optional filters to apply to the tasks
 * @param delayMs Artificial delay in milliseconds to simulate network latency
 * @returns Promise that resolves with paginated task data
 */
export const mockFetchTasks = (
    page: number = 1, 
    limit: number = 50, 
    filters: Record<string, string> = {}, 
    delayMs: number = 500
): Promise<{ data: Task[], total: number, page: number, pageSize: number, totalPages: number }> => {
    // Generate a large set of mock tasks if not already cached
    const allTasks = generateMockTasks(1000);
    
    // Apply any filters (simplified implementation)
    let filteredTasks = [...allTasks];
    
    if (filters.search) {
        const search = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
            task.summary.toLowerCase().includes(search) ||
            task.client.name.toLowerCase().includes(search)
        );
    }
    
    if (filters.status && filters.status !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
            task.status.name.toLowerCase() === filters.status.toLowerCase()
        );
    }
    
    if (filters.priority && filters.priority !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
            task.priority.name.toLowerCase() === filters.priority.toLowerCase()
        );
    }
    
    // Calculate pagination values
    const total = filteredTasks.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const totalPages = Math.ceil(total / limit);
    
    // Get the slice of tasks for the current page
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    // Return a promise that resolves after the specified delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: paginatedTasks,
                total,
                page,
                pageSize: limit,
                totalPages
            });
        }, delayMs);
    });
}
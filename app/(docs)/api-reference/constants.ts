export interface ApiEndpoint {
  name: string
  path: string
  methods: {
    type: 'GET' | 'POST' | 'PUT' | 'DELETE'
    description: string
    params?: {
      name: string
      type: string
      required: boolean
      description: string
    }[]
    returns: {
      status: number
      description: string
      example?: any
    }[]
  }[]
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    name: 'Tasks',
    path: '/api/tickets',
    methods: [
      {
        type: 'GET',
        description: 'Get all tasks or a specific task by ID',
        params: [
          {
            name: 'id',
            type: 'string',
            required: false,
            description: 'Task ID to fetch a specific task'
          }
        ],
        returns: [
          {
            status: 200,
            description: 'Successfully retrieved tasks',
            example: {
              data: [{
                id: '1',
                summary: 'Example Task',
                content: 'Task description',
                status: { id: 1, name: 'Open' },
                priority: { id: 1, name: 'High' },
                created_at: '2024-12-12T13:34:09Z'
              }],
              message: 'Success',
              status: 200
            }
          },
          {
            status: 404,
            description: 'Task not found'
          },
          {
            status: 500,
            description: 'Internal server error'
          }
        ]
      },
      {
        type: 'POST',
        description: 'Create a new task',
        params: [
          {
            name: 'summary',
            type: 'string',
            required: true,
            description: 'Task summary/title'
          },
          {
            name: 'content',
            type: 'string',
            required: true,
            description: 'Task description'
          },
          {
            name: 'ticket_type_id',
            type: 'number',
            required: true,
            description: 'Type of the task'
          },
          {
            name: 'priority_id',
            type: 'number',
            required: true,
            description: 'Priority level ID'
          },
          {
            name: 'impact_id',
            type: 'number',
            required: true,
            description: 'Impact level ID'
          },
          {
            name: 'client_id',
            type: 'number',
            required: true,
            description: 'Client ID'
          },
          {
            name: 'user_id',
            type: 'number',
            required: true,
            description: 'End user ID'
          },
          {
            name: 'site_id',
            type: 'number',
            required: true,
            description: 'Site ID'
          },
          {
            name: 'category_id',
            type: 'number',
            required: true,
            description: 'Category ID'
          },
          {
            name: 'subcategory_id',
            type: 'number',
            required: true,
            description: 'Subcategory ID'
          },
          {
            name: 'agent_id',
            type: 'number',
            required: true,
            description: 'Assigned agent ID'
          }
        ],
        returns: [
          {
            status: 200,
            description: 'Task created successfully',
            example: {
              data: {
                id: '1',
                summary: 'New Task',
                status: { id: 1, name: 'Open' }
              },
              message: 'Task created successfully',
              status: 200
            }
          },
          {
            status: 400,
            description: 'Invalid request data'
          },
          {
            status: 500,
            description: 'Internal server error'
          }
        ]
      },
      {
        type: 'PUT',
        description: 'Update an existing task',
        params: [
          {
            name: 'id',
            type: 'string',
            required: true,
            description: 'Task ID to update'
          },
          {
            name: 'data',
            type: 'object',
            required: true,
            description: 'Updated task data (any task fields)'
          }
        ],
        returns: [
          {
            status: 200,
            description: 'Task updated successfully',
            example: {
              data: {
                id: '1',
                summary: 'Updated Task',
                status: { id: 2, name: 'In Progress' }
              },
              message: 'Task updated successfully',
              status: 200
            }
          },
          {
            status: 404,
            description: 'Task not found'
          },
          {
            status: 400,
            description: 'Invalid request data'
          },
          {
            status: 500,
            description: 'Internal server error'
          }
        ]
      }
    ]
  },
  {
    name: 'Task Dropdowns',
    path: '/api/tasks/dropdowns',
    methods: [
      {
        type: 'GET',
        description: 'Get all dropdown data for task forms',
        returns: [
          {
            status: 200,
            description: 'Successfully retrieved dropdown data',
            example: {
              data: {
                statuses: [{ id: 1, name: 'Open' }],
                priorities: [{ id: 1, name: 'High' }],
                types: [{ id: 1, name: 'Incident' }]
              },
              message: 'Success',
              status: 200
            }
          },
          {
            status: 500,
            description: 'Internal server error'
          }
        ]
      }
    ]
  },
  {
    name: 'Users',
    path: '/api/users',
    methods: [
      {
        type: 'GET',
        description: 'Get all users or a specific user by ID',
        params: [
          {
            name: 'id',
            type: 'string',
            required: false,
            description: 'User ID to fetch a specific user'
          },
          {
            name: 'client_id',
            type: 'string',
            required: false,
            description: 'Client ID to fetch users for a specific client'
          }
        ],
        returns: [
          { status: 200, description: 'Successfully retrieved user(s)' },
          { status: 404, description: 'User not found (when searching by ID)' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'POST',
        description: 'Create a new user',
        params: [
          { name: 'name', type: 'string', required: true, description: 'User name' },
          { name: 'email', type: 'string', required: true, description: 'User email' },
          { name: 'client_id', type: 'number', required: true, description: 'Associated client ID' }
        ],
        returns: [
          { status: 200, description: 'Successfully created user' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'PUT',
        description: 'Update an existing user',
        params: [
          { name: 'id', type: 'number', required: true, description: 'User ID to update' },
          { name: 'name', type: 'string', required: false, description: 'Updated user name' },
          { name: 'email', type: 'string', required: false, description: 'Updated user email' },
          { name: 'client_id', type: 'number', required: false, description: 'Updated client ID' }
        ],
        returns: [
          { status: 200, description: 'Successfully updated user' },
          { status: 404, description: 'User not found' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'DELETE',
        description: 'Delete a user',
        params: [
          { name: 'id', type: 'number', required: true, description: 'User ID to delete' }
        ],
        returns: [
          { status: 200, description: 'Successfully deleted user' },
          { status: 404, description: 'User not found' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Sites',
    path: '/api/sites',
    methods: [
      {
        type: 'GET',
        description: 'Get all sites or a specific site by ID',
        params: [
          {
            name: 'id',
            type: 'string',
            required: false,
            description: 'Site ID to fetch a specific site'
          },
          {
            name: 'client_id',
            type: 'string',
            required: false,
            description: 'Client ID to fetch sites for a specific client'
          }
        ],
        returns: [
          { status: 200, description: 'Successfully retrieved site(s)' },
          { status: 404, description: 'Site not found (when searching by ID)' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'POST',
        description: 'Create a new site',
        params: [
          { name: 'name', type: 'string', required: true, description: 'Site name' },
          { name: 'client_id', type: 'number', required: true, description: 'Associated client ID' }
        ],
        returns: [
          { status: 200, description: 'Successfully created site' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'PUT',
        description: 'Update an existing site',
        params: [
          { name: 'id', type: 'number', required: true, description: 'Site ID to update' },
          { name: 'name', type: 'string', required: false, description: 'Updated site name' },
          { name: 'client_id', type: 'number', required: false, description: 'Updated client ID' }
        ],
        returns: [
          { status: 200, description: 'Successfully updated site' },
          { status: 404, description: 'Site not found' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'DELETE',
        description: 'Delete a site',
        params: [
          { name: 'id', type: 'number', required: true, description: 'Site ID to delete' }
        ],
        returns: [
          { status: 200, description: 'Successfully deleted site' },
          { status: 404, description: 'Site not found' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Clients',
    path: '/api/clients',
    methods: [
      {
        type: 'GET',
        description: 'Get all clients or a specific client by ID',
        params: [
          {
            name: 'id',
            type: 'string',
            required: false,
            description: 'Client ID to fetch a specific client'
          }
        ],
        returns: [
          { status: 200, description: 'Successfully retrieved client(s)' },
          { status: 404, description: 'Client not found (when searching by ID)' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'POST',
        description: 'Create a new client',
        params: [
          { name: 'name', type: 'string', required: true, description: 'Client name' },
          { name: 'email', type: 'string', required: true, description: 'Client email' },
          { name: 'phone', type: 'string', required: false, description: 'Client phone number' }
        ],
        returns: [
          { status: 200, description: 'Successfully created client' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'PUT',
        description: 'Update a client',
        params: [
          { name: 'id', type: 'number', required: true, description: 'Client ID to update' },
          { name: 'name', type: 'string', required: false, description: 'New client name' },
          { name: 'email', type: 'string', required: false, description: 'New client email' },
          { name: 'phone', type: 'string', required: false, description: 'New client phone number' }
        ],
        returns: [
          { status: 200, description: 'Successfully updated client' },
          { status: 404, description: 'Client not found' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'DELETE',
        description: 'Delete a client',
        params: [
          { name: 'id', type: 'number', required: true, description: 'Client ID to delete' }
        ],
        returns: [
          { status: 200, description: 'Successfully deleted client' },
          { status: 404, description: 'Client not found' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Authentication',
    path: '/api/auth',
    methods: [
      {
        type: 'POST',
        description: 'Login to the system',
        params: [
          { name: 'email', type: 'string', required: true, description: 'User email' },
          { name: 'password', type: 'string', required: true, description: 'User password' }
        ],
        returns: [
          { status: 200, description: 'Successfully logged in' },
          { status: 401, description: 'Invalid credentials' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'POST',
        description: 'Logout from the system',
        params: [],
        returns: [
          { status: 200, description: 'Successfully logged out' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'GET',
        description: 'Get current session information',
        params: [],
        returns: [
          { status: 200, description: 'Session information retrieved' },
          { status: 401, description: 'No active session' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Task Types',
    path: '/api/tasktypes',
    methods: [
      {
        type: 'GET',
        description: 'Get all task types',
        params: [],
        returns: [
          { status: 200, description: 'Successfully retrieved task types' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Priorities',
    path: '/api/priorities',
    methods: [
      {
        type: 'GET',
        description: 'Get all priority levels',
        params: [],
        returns: [
          { status: 200, description: 'Successfully retrieved priorities' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Impacts',
    path: '/api/impacts',
    methods: [
      {
        type: 'GET',
        description: 'Get all impact levels',
        params: [],
        returns: [
          { status: 200, description: 'Successfully retrieved impacts' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Urgencies',
    path: '/api/urgencies',
    methods: [
      {
        type: 'GET',
        description: 'Get all urgency levels',
        params: [],
        returns: [
          { status: 200, description: 'Successfully retrieved urgencies' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Categories',
    path: '/api/categories',
    methods: [
      {
        type: 'GET',
        description: 'Get all task categories',
        params: [],
        returns: [
          { status: 200, description: 'Successfully retrieved categories' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Ticket Sources',
    path: '/api/ticketsources',
    methods: [
      {
        type: 'GET',
        description: 'Get all task sources',
        params: [],
        returns: [
          { status: 200, description: 'Successfully retrieved task sources' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Statuses',
    path: '/api/statuses',
    methods: [
      {
        type: 'GET',
        description: 'Get all available task statuses',
        returns: [
          { 
            status: 200, 
            description: 'Successfully retrieved statuses',
            example: [
              { id: 1, name: "Open", description: "Task is open and needs attention" },
              { id: 2, name: "In Progress", description: "Task is being worked on" },
              { id: 3, name: "Resolved", description: "Task has been resolved" },
              { id: 4, name: "Closed", description: "Task is closed" }
            ]
          },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Tiers',
    path: '/api/tiers',
    methods: [
      {
        type: 'GET',
        description: 'Get all available task tiers',
        returns: [
          { 
            status: 200, 
            description: 'Successfully retrieved tiers',
            example: [
              { id: 1, name: "Tier 1", description: "First level support" },
              { id: 2, name: "Tier 2", description: "Second level support" },
              { id: 3, name: "Tier 3", description: "Third level support" }
            ]
          },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  },
  {
    name: 'Activities',
    path: '/api/activities',
    methods: [
      {
        type: 'GET',
        description: 'Get an activity by ID or activities by task ID',
        params: [
          {
            name: 'id',
            type: 'number',
            required: false,
            description: 'Activity ID to fetch a specific activity'
          },
          {
            name: 'task_id',
            type: 'number',
            required: false,
            description: 'Task ID to fetch activities for a specific task'
          }
        ],
        returns: [
          { 
            status: 200, 
            description: 'Successfully retrieved activity(s)',
            example: {
              data: {
                id: 1,
                content: "Activity content",
                activity_type: {
                  id: 1,
                  name: "Private Note"
                },
                status: {
                  id: 1,
                  name: "NEW"
                },
                agent: {
                  id: 1,
                  first_name: "John",
                  last_name: "Doe"
                },
                date_start: "2024-01-01T00:00:00Z",
                date_end: "2024-01-01T00:00:00Z",
                time_elapse: 30
              },
              message: "ok",
              status: 200
            }
          },
          { status: 404, description: 'Activity not found' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'POST',
        description: 'Create a new activity',
        params: [
          {
            name: 'content',
            type: 'string',
            required: true,
            description: 'Content of the activity'
          },
          {
            name: 'activity_type_id',
            type: 'number',
            required: true,
            description: 'ID of the activity type'
          },
          {
            name: 'status_id',
            type: 'number',
            required: true,
            description: 'ID of the status'
          },
          {
            name: 'agent_id',
            type: 'number',
            required: true,
            description: 'ID of the agent'
          },
          {
            name: 'date_start',
            type: 'string',
            required: true,
            description: 'Start date and time (ISO format)'
          },
          {
            name: 'date_end',
            type: 'string',
            required: true,
            description: 'End date and time (ISO format)'
          },
          {
            name: 'time_elapse',
            type: 'number',
            required: true,
            description: 'Time elapsed in minutes'
          },
          {
            name: 'task_id',
            type: 'number',
            required: true,
            description: 'ID of the associated task'
          }
        ],
        returns: [
          { 
            status: 200, 
            description: 'Successfully created activity',
            example: {
              data: {
                id: 1,
                content: "New activity",
                activity_type: { id: 1, name: "Private Note" },
                status: { id: 1, name: "NEW" },
                agent: { id: 1, first_name: "John", last_name: "Doe" },
                date_start: "2024-01-01T00:00:00Z",
                date_end: "2024-01-01T00:00:00Z",
                time_elapse: 30
              },
              message: "ok",
              status: 200
            }
          },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'PUT',
        description: 'Update an existing activity',
        params: [
          {
            name: 'id',
            type: 'number',
            required: true,
            description: 'ID of the activity to update'
          },
          {
            name: 'content',
            type: 'string',
            required: false,
            description: 'Updated content'
          },
          {
            name: 'activity_type_id',
            type: 'number',
            required: false,
            description: 'Updated activity type ID'
          },
          {
            name: 'status_id',
            type: 'number',
            required: false,
            description: 'Updated status ID'
          },
          {
            name: 'date_start',
            type: 'string',
            required: false,
            description: 'Updated start date'
          },
          {
            name: 'date_end',
            type: 'string',
            required: false,
            description: 'Updated end date'
          },
          {
            name: 'time_elapse',
            type: 'number',
            required: false,
            description: 'Updated time elapsed'
          }
        ],
        returns: [
          { status: 200, description: 'Successfully updated activity' },
          { status: 400, description: 'Activity ID is required' },
          { status: 500, description: 'Internal server error' }
        ]
      },
      {
        type: 'DELETE',
        description: 'Delete an activity',
        params: [
          {
            name: 'id',
            type: 'number',
            required: true,
            description: 'ID of the activity to delete'
          }
        ],
        returns: [
          { status: 200, description: 'Successfully deleted activity' },
          { status: 404, description: 'Activity not found' },
          { status: 500, description: 'Internal server error' }
        ]
      }
    ]
  }
]

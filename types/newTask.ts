export interface Impact {
  id: number
  name: string
  updated_at: string
  created_at: string
}

export interface TaskType {
  id: number
  name: string
  updated_at: string
  created_at: string
}

export interface Priority {
  id: number
  name: string
  updated_at: string
  created_at: string
}

export interface Urgency {
  id: number
  name: string
  updated_at: string
  created_at: string
}

export interface Category {
  id: number
  name: string
  updated_at: string
  created_at: string
}

export interface TaskSource {
  id: number
  name: string
  updated_at: string
  created_at: string
}

export interface Subcategory {
  id: number
  name: string
  category_id: number
  updated_at: string
  created_at: string
}

export interface RequestSubcategory {
  value: string
  label: string
}

export interface ManualUser {
  first_name: string
  last_name: string
  phone: string
  address: string
  email: string
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface EndUser {
  client: DropdownOption | null
  user: DropdownOption | null
  site: DropdownOption | null
  technical_aptitude: number
  manual_user: ManualUser
}

export interface Additional {
  category: DropdownOption | null
  subcategory: DropdownOption | null
  ticket_source: DropdownOption | null
  request_category: DropdownOption | null
  attachments: File[]
}

export interface Task {
  summary: string
  description: string
  type: DropdownOption | null
  priority: DropdownOption | null
  impact: DropdownOption | null
  time_of_request: Date | null
  after_hours: boolean
}

export interface NewTask {
  task: Task
  end_user: EndUser
  additional: Additional
}

// Centralized error handling types (moved from store to avoid circular imports)
export interface ValidationErrors {
  // Manual user errors
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  technical_aptitude?: string
  
  // End user selection errors
  client?: string
  user?: string
  site?: string
  
  // Task details errors
  type?: string
  summary?: string
  description?: string
  priority?: string
  impact?: string
  
  // Additional info errors
  category?: string
  subcategory?: string
  ticket_source?: string
  request_category?: string
  
  // General errors
  general?: string
}

export interface ErrorState {
  errors: ValidationErrors
  isValidating: boolean
  hasErrors: boolean
}

export interface NewTaskStore {
  newTask: NewTask
  
  // Centralized error state
  errorState: ErrorState
  
  // Task management
  setNewTask: (task: Partial<NewTask>) => void
  resetNewTask: () => void
  
  // Error management
  setErrors: (errors: ValidationErrors) => void
  setFieldError: (field: keyof ValidationErrors, error: string | undefined) => void
  clearErrors: () => void
  setValidating: (isValidating: boolean) => void
  
  // Validation methods
  validateManualUser: () => ValidationErrors
  validateManualUserAsync: () => Promise<ValidationErrors>
  validateNewTask: () => ValidationErrors
  
  // Submission methods
  submitNewTask: () => Promise<CreateTask>
  createManualUserAndSubmitTask: () => Promise<CreateTask>
}

export interface CreateTask {
  id?: number
  summary: string
  agent_id: number
  user_id: number
  client_id?: number
  site_id: number
  ticket_type_id: number
  priority_id: number
  impact_id: number
  urgency_id: number
  category_id: number
  subcategory_id?: number
  ticket_source_id: number
  status_id: number,
  tier_id: number,
  date_closed: string | null
  time_of_request?: string | null
  after_hours?: boolean
}

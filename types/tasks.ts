import { Client, User, Site } from "./clients";
import {TaskSource, TaskType, Priority, Impact } from "./newTask";
import { FileData } from "./upload";

export enum TaskAction {
  Resolving = "resolving",
  Noting = "noting",
  Emailing = "emailing",
  Viewing = "viewing",
  Progressing = "progressing"
}

export interface TaskUpdateFormData {
  id: number
  status_id?: number
  agent_id?: number
}

export interface DataState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  setTasks: (tasks: Task[]) => void
  setIsLoading: (isLoading: boolean) => void
  getTasksByClientId: (clientId: number) => Task[]
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface TaskDropdowns {
  clients: DropdownOption[];
  users: DropdownOption[];
  sites: DropdownOption[];
  taskTypes: DropdownOption[];
  priorities: DropdownOption[];
  impacts: DropdownOption[];
  urgencies: DropdownOption[];
  categories: DropdownOption[];
  ticketSources: DropdownOption[];
  statuses: DropdownOption[];
}

export interface ChildTicket {
  id: number;
  master_ticket_id: number;
  child_ticket_id: number;
  created_at: string;
  ticket_details?: {
    id: number;
    summary: string | null;
    client: Client;
    status: Status;
    ticket_type: TaskType;
    priority: Priority;
    impact: Impact;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    agent: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
    created_at: string;
    updated_at: string;
    date_closed: string | null;
  } | null;
}

export interface Task {
  id: number;
  activities: TaskActivity[];
  summary: string;
  client: Client;
  agent: User;
  sites: Site;
  user: User;
  triager: User;
  status: Status;
  ticket_source: TaskSource;
  ticket_type: TaskType;
  priority: Priority;
  impact: Impact;
  category?: {
    id: number;
    name: string;
  } | null;
  subcategory?: {
    id: number;
    name: string;
  } | null;
  assignee_order?: number;
  created_at: string;
  updated_at: string;
  date_closed: string;
  analysis: string | null;
  child_ticket_ids?: string; // Comma-separated list of merged ticket IDs (deprecated)
  child_tickets?: ChildTicket[]; // New structure for merged tickets
  parent_ticket?: {
    id: number;
    summary: string;
    status: Status;
    agent: {
      id: number;
      first_name: string;
      last_name: string;
    };
  } | null; // Parent ticket information if this task is a child
  running_time?: number; // Total running time in seconds
  total_time_seconds?: number; // Total accrued time in seconds
  time_of_request?: string | null; // When the ticket was requested
  after_hours?: boolean; // Whether ticket was created after hours
}

export interface Status {
  id: number;
  name: string;
  updated_at: string;
}

export interface Tier {
  id: number;
  name: string;
  description: string;
}

export interface ActivityType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskActivity { 
  id: number;
  agent_id: number;
  content: string;
  agent: {
    id: number;
    first_name: string;
    last_name: string;
  };
  time_elapse: number;
  activity_type: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  date_end: string;
  date_start: string;
  created_at: string;
  updated_at: string;
  files?: FileData[];
  from?: string;
  email_cc: string;
  email_id: string;
  email_to: string;
}

export interface TimeEntry {
  id: number;
  ticket_id: number;
  user_id: number;
  user?: User;
  start_time: Date;
  end_time?: Date | null;
  duration?: number | null; // Duration in seconds
  description?: string | null;
  entry_type: string; // 'manual' or 'automatic'
  is_billable: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TaskQueueCardProps {
  task: Task & {
    client?: {
      id: number;
      name: string;
      avatar_url?: string | null;
      is_vip?: boolean;
    } | null;
    ticket_type: {
      id: number;
      name: string;
    };
    priority: {
      id: number;
      name: string;
    };
    impact: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    agent?: {
      id: number;
      name: string;
      avatar_url?: string | null;
      initials?: string;
      } | null;
  };
  collapsed?: boolean;
}
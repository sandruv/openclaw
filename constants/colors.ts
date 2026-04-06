// Task ticket type colors
export const TICKET_TYPE_COLORS = {
  incident: 'bg-red-500',
  request: 'bg-orange-500',
  opportunity: 'bg-blue-500',
  "scheduled task": 'bg-yellow-500',
  project: 'bg-green-500',
  none: 'bg-gray-500'
}

// Task priority colors
export const PRIORITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  none: 'bg-gray-500'
}

// Task impact colors
export const IMPACT_COLORS = {
  "company wide": 'bg-red-500',
  "multiple users": 'bg-orange-500',
  "single user": 'bg-yellow-500',
  none: 'bg-gray-500'
}

// Task status colors
export const STATUS_COLORS = {
  'new': 'bg-green-500', // Fresh tickets - green for "go"
  'in progress': 'bg-blue-500', // Active work - blue for "in motion"
  'on hold': 'bg-amber-500', // Paused - amber for "caution"
  'pending end-user': 'bg-purple-500', // Waiting for user - purple for "external"
  'user responded': 'bg-rose-500', // User action - indigo for "attention"
  'closed': 'bg-gray-500', // Completed - black for "finished"
  'archived': 'bg-gray-200',
  'reopened': 'bg-lime-500',
  'assigned': 'bg-teal-500'
}

// client status colors
export const CLIENT_STATUS_COLORS = {
  'active': 'bg-green-500',
  'inactive': 'bg-red-500',
  'pending': 'bg-yellow-500'
}

// tech aptitude level colors
export const TECH_APTITUDE_COLORS = {
  '2': 'bg-yellow-600',
  '3': 'bg-blue-600',
  '4': 'bg-green-600',
  '5': 'bg-purple-600',
  'default': 'bg-gray-600'
}

// user role badge colors
export const ROLE_BADGE_COLORS = {
  'Admin': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-black dark:text-white' },
  'User': { bg: 'bg-blue-100 dark:bg-blue-800', text: 'text-black dark:text-white' },
  'Guest': { bg: 'bg-yellow-100 dark:bg-yellow-800', text: 'text-black dark:text-white' },
  'default': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-black dark:text-white' }
}

// Role colors - defined color scheme for role types
// Agent (id=1) = violet, Client User (id=2) = blue, Admin (id=3) = amber
export const ROLE_COLORS = {
  'Agent': { bg: 'bg-green-500', text: 'text-white' },
  'Client User': { bg: 'bg-violet-500', text: 'text-white' },
  'Admin': { bg: 'bg-amber-500', text: 'text-white' },
  'default': { bg: 'bg-gray-500', text: 'text-white' }
}

// Avatar colors for viewers
export const AVATAR_COLORS = [
  'bg-sky-500',  
  'bg-yellow-500',
  'bg-lime-500',
  'bg-teal-500',
  'bg-amber-500',  
  'bg-rose-500',   
  'bg-purple-500', 
  'bg-emerald-500', 
  'bg-indigo-500',  
  'bg-pink-500'   
];

export const YW_PORTAL_COLORS = {
  'primary': '#81C34D',
}

// Patch update priority colors
export const PATCH_UPDATE_PRIORITY_COLORS = {
  critical: 'bg-red-500 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-green-500 text-white',
  default: 'bg-gray-500 text-white'
}

// Helper functions for patch updates
export const patchUpdateHelpers = {
  getPriorityColor(priority: string): string {
    return PATCH_UPDATE_PRIORITY_COLORS[priority as keyof typeof PATCH_UPDATE_PRIORITY_COLORS] || PATCH_UPDATE_PRIORITY_COLORS.default;
  },

  getPriorityColorOnly(priority: string): string {
    return PATCH_UPDATE_PRIORITY_COLORS[priority as keyof typeof PATCH_UPDATE_PRIORITY_COLORS].split(' ')[0].replace('bg-', '');
  },

  formatPriority(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  },
}

// Preset theme colors for UI elements (folders, themes, etc.)
export const PRESET_THEME_COLORS = [
  { name: 'Sky', value: '#0055A5', tailwind: 'sky-700' },
  { name: 'Violet', value: '#8b5cf6', tailwind: 'violet-500' },
  { name: 'Pink', value: '#ec4899', tailwind: 'pink-500' },
  { name: 'Amber', value: '#f59e0b', tailwind: 'amber-500' },
  { name: 'Emerald', value: '#10b981', tailwind: 'emerald-500' },
  { name: 'Blue', value: '#3b82f6', tailwind: 'blue-500' },
  { name: 'Red', value: '#ef4444', tailwind: 'red-500' },
  { name: 'Cyan', value: '#06b6d4', tailwind: 'cyan-500' },
]
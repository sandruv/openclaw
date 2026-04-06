import { TICKET_TYPE_COLORS, PRIORITY_COLORS, IMPACT_COLORS, STATUS_COLORS } from '@/constants/colors'
import { TICKET_TYPE_ICON_MAP, PRIORITY_ICON_MAP, IMPACT_ICON_MAP } from '@/constants/icons'
import type { LucideIcon } from 'lucide-react'

// Define the ticket types
export type TicketType = 'incident' | 'request' | 'opportunity' | 'scheduled task' | 'project' | 'none'

// Define the priority types
export type PriorityType = 'critical' | 'high' | 'medium' | 'low' | 'none'

// Define the impact types
export type ImpactType = 'company wide' | 'multiple users' | 'single user' | 'none'

// Define the status types
export type StatusType = 'new' | 'in progress' | 'on hold' | 'pending end-user' | 'user responded' | 'closed' | 'archived'
/**
 * Get the icon component for a ticket type
 * @param typeKey The ticket type key
 * @returns The icon component for the ticket type
 */
export function getTicketTypeIcon(typeKey: TicketType): LucideIcon {
  return TICKET_TYPE_ICON_MAP[typeKey] || TICKET_TYPE_ICON_MAP['none']
}

/**
 * Get the color class for a ticket type
 * @param typeKey The ticket type key
 * @returns The color class for the ticket type with the specified prefix
 */
export function getTicketTypeColor(typeKey: TicketType, prefix: string = 'bg-'): string {
  const color = TICKET_TYPE_COLORS[typeKey.toLowerCase() as TicketType];
  if (!color) {
    return `${prefix}gray-500`; // Default fallback color
  }
  return color.replace('bg-', prefix);
}

/**
 * Get the icon component for a priority type
 * @param priorityKey The priority type key
 * @returns The icon component for the priority type
 */
export function getPriorityIcon(priorityKey: PriorityType): LucideIcon {
  return PRIORITY_ICON_MAP[priorityKey] || PRIORITY_ICON_MAP['none']
}

/**
 * Get the color class for a priority type
 * @param priorityKey The priority type key
 * @param prefix The prefix to use for the color class (default: 'bg-')
 * @returns The color class for the priority type with the specified prefix
 */
export function getPriorityColor(priorityKey: PriorityType, prefix: string = 'bg-'): string {
  const color = PRIORITY_COLORS[priorityKey.toLowerCase() as PriorityType];
  if (!color) {
    return `${prefix}gray-500`; // Default fallback color
  }
  return color.replace('bg-', prefix);
}

/**
 * Get the icon component for an impact type
 * @param impactKey The impact type key
 * @returns The icon component for the impact type
 */
export function getImpactIcon(impactKey: ImpactType): LucideIcon {
  return IMPACT_ICON_MAP[impactKey] || IMPACT_ICON_MAP['none']
}

/**
 * Get the color class for an impact type
 * @param impactKey The impact type key
 * @param prefix The prefix to use for the color class (default: 'bg-')
 * @returns The color class for the impact type with the specified prefix
 */
export function getImpactColor(impactKey: ImpactType, prefix: string = 'bg-'): string {
  const color = IMPACT_COLORS[impactKey.toLowerCase() as ImpactType];
  if (!color) {
    return `${prefix}gray-500`; // Default fallback color
  }
  return color.replace('bg-', prefix);
}

/**
 * Get the color class for a status type
 * @param statusKey The status type key
 * @param prefix The prefix to use for the color class (default: 'bg-')
 * @returns The color class for the status type with the specified prefix
 */
export function getStatusColor(statusKey: StatusType, prefix: string = 'bg-'): string {
  const color = STATUS_COLORS[statusKey.toLowerCase() as StatusType];
  if (!color) {
    return `${prefix}gray-500`; // Default fallback color
  }
  return color.replace('bg-', prefix);
}
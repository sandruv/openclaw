import { AlertTriangle, FileQuestion, Lightbulb, CalendarClock, FolderKanban, 
  Flame, ClockAlert, AlarmClock, Building2, Users, User, ClockArrowDown,
  Signal, SignalLow, SignalMedium, SignalHigh, CircleMinus, FileUser, ShieldQuestionIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Types for task properties - kept in sync with those in taskUtils.ts
import { TicketType, PriorityType, ImpactType } from '@/lib/taskUtils'

/**
 * Map ticket types to icon components
 */
export const TICKET_TYPE_ICON_MAP: Record<TicketType, LucideIcon> = {
  'incident': AlertTriangle,
  'request': FileUser,
  'opportunity': Lightbulb,
  'scheduled task': CalendarClock,
  'project': FolderKanban,
  'none': FileQuestion
}

/**
 * Map priority types to icon components
 */
export const PRIORITY_ICON_MAP: Record<PriorityType, LucideIcon> = {
  'critical': Flame,
  'high': AlarmClock,
  'medium': ClockAlert,
  'low': ClockArrowDown,
  'none': CircleMinus
}

/**
 * Map impact types to icon components
 */
export const IMPACT_ICON_MAP: Record<ImpactType, LucideIcon> = {
  'company wide': Building2,
  'multiple users': Users,
  'single user': User,
  'none': ShieldQuestionIcon
}

/**
 * Map tech aptitude levels to icon components
 */
export const TECH_APTITUDE_ICON_MAP: Record<string, LucideIcon> = {
  '2': SignalLow,
  '3': SignalMedium,
  '4': SignalHigh,
  '5': Signal,
  'default': SignalLow
}

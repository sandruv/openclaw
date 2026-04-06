import React, { useEffect, useRef } from 'react'
import { useTimerStore, ActiveTimerInfo } from '@/stores/useTimerStore'
import { useSessionStore } from '@/stores/useSessionStore'
import { RoleProvider } from '@/lib/roleProvider'

const MANUALLY_STOPPED_STORAGE_KEY = 'timer_manually_stopped_tickets'

/**
 * Mark a ticket as manually stopped to prevent auto-start until page refresh
 * This can be used by any component that stops a timer or changes status
 */
export function markTicketAsManuallyStoppedInSession(ticketId: number): void {
  console.log("[markTicketAsManuallyStoppedInSession]:", ticketId)
  if (typeof window === 'undefined') return
  try {
    const stored = sessionStorage.getItem(MANUALLY_STOPPED_STORAGE_KEY)
    const tickets = stored ? new Set(JSON.parse(stored)) : new Set<number>()
    tickets.add(ticketId)
    sessionStorage.setItem(MANUALLY_STOPPED_STORAGE_KEY, JSON.stringify([...tickets]))
    console.log("[markTicketAsManuallyStoppedInSession]:", sessionStorage.getItem(MANUALLY_STOPPED_STORAGE_KEY))
  } catch (e) {
    console.error('Error marking ticket as manually stopped:', e)
  }
}

/**
 * Get manually stopped tickets from sessionStorage
 */
function getManuallyStoppedTickets(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = sessionStorage.getItem(MANUALLY_STOPPED_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return new Set(parsed)
    }
  } catch (e) {
    console.error('Error reading manually stopped tickets from storage:', e)
  }
  return new Set()
}

/**
 * Save manually stopped tickets to sessionStorage
 */
function saveManuallyStoppedTickets(tickets: Set<number>): void {
  console.log("[saveManuallyStoppedTickets]:", tickets)
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(MANUALLY_STOPPED_STORAGE_KEY, JSON.stringify([...tickets]))
    console.log("[saveManuallyStoppedTickets]:", sessionStorage.getItem(MANUALLY_STOPPED_STORAGE_KEY))
  } catch (e) {
    console.error('Error saving manually stopped tickets to storage:', e)
  }
}

/**
 * Check if a ticket was manually stopped and consume (remove) it from storage.
 * This is a "read once" pattern - after checking, the ticket is removed so
 * the next page refresh will allow auto-start.
 */
function consumeManuallyStoppedTicket(ticketId: number, ticketsRef: React.MutableRefObject<Set<number>>): boolean {
  console.log(`Checking if ticket #${ticketId} was manually stopped`)
  if (!ticketsRef.current.has(ticketId)) return false
  
  console.log(`Consuming ticket #${ticketId} that was manually stopped`)
  // Remove from ref and storage (consume the entry)
  ticketsRef.current.delete(ticketId)
  saveManuallyStoppedTickets(ticketsRef.current)
  
  return true // Was manually stopped, skip auto-start this time
}

interface UseTimerAutoStartProps {
  taskId: number | undefined
  isTaskClosed: boolean
  isNavigating: boolean
  onShowTransferDialog: (activeTimer: ActiveTimerInfo) => void
  taskStatusId?: number // Current ticket's status - needed for priority logic
}

interface UseTimerAutoStartReturn {
  markAsManuallyStoppedTicket: (ticketId: number) => void
}

/**
 * Hook to handle auto-starting timer when viewing a task
 * Also handles showing transfer dialog when timer is running on another task
 * NOTE: Admins are excluded from auto-start (they use manual time entry instead)
 */
export function useTimerAutoStart({
  taskId,
  isTaskClosed,
  isNavigating,
  onShowTransferDialog,
  taskStatusId,
}: UseTimerAutoStartProps): UseTimerAutoStartReturn {
  // Initialize from sessionStorage to persist across page reloads
  const manuallyStoppedTicketsRef = useRef<Set<number>>(getManuallyStoppedTickets())

  const { user } = useSessionStore()
  const {
    isTimerRunning,
    activeTicketId,
    checkGlobalActiveTimer,
    startTimerOnView,
  } = useTimerStore()

  // Check if user is admin (admins should NOT have auto-start timer)
  const isAdmin = user ? RoleProvider.isAdmin({ 
    id: user.id, 
    role_id: user.role_id ? Number(user.role_id) : undefined 
  }) : false

  useEffect(() => {
    console.log("[useTimerAutoStart]:", manuallyStoppedTicketsRef.current)
    // Skip during navigation to prevent dialog flicker
    if (isNavigating || !taskId) return

    // Skip auto-start for admin users (they use manual time entry)
    if (isAdmin) return

    // CRITICAL: If ticket is closed and timer is running on THIS ticket, stop it immediately
    if (isTaskClosed && isTimerRunning && activeTicketId === taskId) {
      console.log(`Ticket #${taskId} is closed but timer is still running. This should not happen - stopping timer.`)
      // The timer will be stopped by the backend validation when ticket details load
      return
    }

    // Skip auto-start if ticket is closed
    if (isTaskClosed) return

    // Check if there's already an active timer on THIS ticket (from store state)
    if (isTimerRunning && activeTicketId === taskId) return

    let cancelled = false
    const currentTaskId = taskId

    const checkAndStartTimer = async () => {
      // Check for active timer globally (API call)
      const activeTimer = await checkGlobalActiveTimer()

      // Abort if navigation occurred or component unmounted during async call
      if (cancelled) return

      if (activeTimer) {
        if (Number(activeTimer.ticketId) === Number(currentTaskId)) {
          // Timer already running on THIS ticket - no action needed
          console.log(`Timer already active on this ticket #${currentTaskId}`)
          return
        }
        
        // Timer running on ANOTHER ticket - check priority
        const TaskStatusType = { InProgress: 2 } // Import from taskStatusIdProvider if needed
        const otherTicketIsInProgress = activeTimer.statusId === TaskStatusType.InProgress
        const currentTicketIsInProgress = taskStatusId === TaskStatusType.InProgress
        
        if (!otherTicketIsInProgress && currentTicketIsInProgress) {
          // Current ticket is In Progress and other is not - current has priority
          console.log(`Current ticket #${currentTaskId} is In Progress and has priority. Showing transfer dialog.`)
          onShowTransferDialog(activeTimer)
          return
        }
        
        // Standard case: show transfer dialog
        onShowTransferDialog(activeTimer)
      } else {
        // No active timer anywhere - check if manually stopped (consume on read)
        // If it was manually stopped, skip auto-start THIS time but allow it on next refresh
        const wasManuallyStoppedThisSession = consumeManuallyStoppedTicket(currentTaskId, manuallyStoppedTicketsRef)
        if (!wasManuallyStoppedThisSession) {
          await startTimerOnView(currentTaskId)
        }
      }
    }

    checkAndStartTimer()

    return () => {
      cancelled = true
    }
  }, [taskId, taskStatusId, isTaskClosed, isNavigating, isTimerRunning, activeTicketId, checkGlobalActiveTimer, startTimerOnView, onShowTransferDialog, isAdmin])

  const markAsManuallyStoppedTicket = (ticketId: number) => {
    manuallyStoppedTicketsRef.current.add(ticketId)
    // Persist to sessionStorage so it survives page reloads
    saveManuallyStoppedTickets(manuallyStoppedTicketsRef.current)
  }

  return { markAsManuallyStoppedTicket }
}

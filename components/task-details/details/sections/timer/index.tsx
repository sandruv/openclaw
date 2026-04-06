'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Clock, CircleStop, RefreshCw, Play } from "lucide-react"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { TaskStatusType } from "@/lib/taskStatusIdProvider"
import { useSessionStore } from "@/stores/useSessionStore"
import { useTimerStore, ActiveTimerInfo } from "@/stores/useTimerStore"
import pusherService from "@/services/pusherService"
import { formatDuration } from '@/lib/dateTimeFormat'
import { TimerDrawer } from "./drawer"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TimerTransferDialog } from './dialog/TimerTransferDialog'
import { TimerStopDialog } from './dialog/TimerStopDialog'
import { TimerContinueDialog } from './dialog/TimerContinueDialog'
import {
  useTimerNotifications,
  useBrowserTabTitle,
  useTimerAutoStart,
  useTimerIncrement,
  useTimerInactivityCheck,
} from './hooks'
import { RoleProvider } from '@/lib/roleProvider'
import {
  NOTIFICATION_INTERVAL_MINUTES,
  INACTIVITY_CHECK_INTERVAL_MINUTES,
  INACTIVITY_TIMEOUT_SECONDS,
} from './timerConfig'

// ============================================================================
// Main Component
// ============================================================================
export function Timer() {
  // ---------------------------------------------------------------------------
  // External Store & Context
  // ---------------------------------------------------------------------------
  const { task, isNavigating, createActivity, updateTask } = useTaskDetailsStore()
  const currentUser = useSessionStore(state => state.user)
  const { showToast } = useToast()
  const { compactMode } = useSettingsStore()

  const {
    isTimerRunning,
    localTimer,
    activeUserId,
    activeTicketId,
    timeEntries,
    isFetchingTimeEntries,
    loadTimeEntries,
    setupSocketListeners,
    incrementTimer,
    handleVisibilityChange,
    transferTimerToTicket,
    stopTimerWithNote,
    checkGlobalActiveTimer,
    startTimerOnView,
  } = useTimerStore()

  // Check if user is admin (admins have manual start button instead of auto-start)
  const isAdmin = currentUser ? RoleProvider.isAdmin({ 
    id: currentUser.id, 
    role_id: currentUser.role_id ? Number(currentUser.role_id) : undefined 
  }) : false

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const localTimerRef = useRef<number>(0)

  // ---------------------------------------------------------------------------
  // Local State
  // ---------------------------------------------------------------------------
  const [completedTimeSeconds, setCompletedTimeSeconds] = useState(0)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showStopDialog, setShowStopDialog] = useState(false)
  const [pendingActiveTimer, setPendingActiveTimer] = useState<ActiveTimerInfo | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ---------------------------------------------------------------------------
  // Derived State
  // ---------------------------------------------------------------------------
  const isCurrentTaskTimerRunning = isTimerRunning && activeTicketId === task?.id
  const isCurrentUserTimer = activeUserId === currentUser?.id
  const isActiveForCurrentUser = isCurrentTaskTimerRunning && isCurrentUserTimer
  const canControlTimer = !isTimerRunning || activeUserId === currentUser?.id || 
    parseInt(currentUser?.role_id as string) === 3
  const accruedTimeSeconds = completedTimeSeconds + (isCurrentTaskTimerRunning ? localTimer : 0)

  // ---------------------------------------------------------------------------
  // Callbacks for Hooks
  // ---------------------------------------------------------------------------
  const handleShowTransferDialog = useCallback((activeTimer: ActiveTimerInfo) => {
    setPendingActiveTimer(activeTimer)
    setShowTransferDialog(true)
  }, [])

  const getElapsedSeconds = useCallback(() => localTimerRef.current, [])

  const handleRefreshTimer = useCallback(async () => {
    if (!task?.id || isRefreshing) return
    setIsRefreshing(true)
    try {
      await loadTimeEntries(task.id)
      showToast({
        title: "Refreshed",
        description: "Timer data has been refreshed.",
        type: "success",
      })
    } catch (error) {
      console.error('Error refreshing timer:', error)
      showToast({
        title: "Error",
        description: "Failed to refresh timer data.",
        type: "error",
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [task?.id, isRefreshing, loadTimeEntries, showToast])

  // ---------------------------------------------------------------------------
  // Custom Hooks
  // ---------------------------------------------------------------------------
  const { markAsManuallyStoppedTicket } = useTimerAutoStart({
    taskId: task?.id,
    isTaskClosed: task?.status?.id === TaskStatusType.Closed || task?.status?.id === TaskStatusType.Archived,
    isNavigating,
    onShowTransferDialog: handleShowTransferDialog,
    taskStatusId: task?.status?.id, // Pass status for priority logic
  })

  useTimerIncrement({
    isRunning: isCurrentTaskTimerRunning,
    onIncrement: incrementTimer,
  })

  useBrowserTabTitle({
    taskId: task?.id,
    elapsedSeconds: localTimer,
    isRunning: isActiveForCurrentUser,
  })

  useTimerNotifications({
    taskId: task?.id,
    isRunning: isActiveForCurrentUser,
    intervalMinutes: NOTIFICATION_INTERVAL_MINUTES,
    getElapsedSeconds,
  })

  // Handle inactivity timeout - auto-stop timer
  const handleInactivityTimeout = useCallback(async () => {
    if (!task?.id) return
    
    try {
      const success = await stopTimerWithNote(task.id, 'Auto-stopped due to inactivity')
      if (success) {
        markAsManuallyStoppedTicket(task.id)
        
        // If status is "In Progress", change to "On Hold" and add a system private note
        if (task.status?.id === TaskStatusType.InProgress) {
          // Create system-generated private note
          await createActivity({
            content: '[System] Timer auto-stopped due to inactivity. Status changed from In Progress to On Hold.',
            activity_type_id: 2, // Private Note
            status_id: TaskStatusType.OnHold,
            date_start: new Date(),
            date_end: new Date(),
          })
          
          // Update task status to On Hold
          await updateTask({ status_id: TaskStatusType.OnHold })
        }
        
        showToast({
          title: "Timer auto-stopped",
          description: task.status?.id === TaskStatusType.InProgress 
            ? "Timer was stopped due to inactivity. Status changed to On Hold."
            : "Timer was stopped due to inactivity. Your time has been saved.",
          type: "warning",
        })
      }
    } catch (error) {
      console.error('Error auto-stopping timer:', error)
    }
  }, [task?.id, task?.status?.id, stopTimerWithNote, markAsManuallyStoppedTicket, showToast, createActivity, updateTask])

  const {
    showConfirmation: showInactivityDialog,
    remainingSeconds: inactivityRemainingSeconds,
    onConfirm: handleContinueWorking,
    onDismiss: handleDismissInactivity,
  } = useTimerInactivityCheck({
    isRunning: isActiveForCurrentUser,
    checkIntervalMinutes: INACTIVITY_CHECK_INTERVAL_MINUTES,
    confirmationTimeoutSeconds: INACTIVITY_TIMEOUT_SECONDS,
    onTimeout: handleInactivityTimeout,
  })

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  
  // Keep local ref in sync with store timer
  useEffect(() => {
    localTimerRef.current = localTimer
  }, [localTimer])

  // Reset dialog state when task changes
  useEffect(() => {
    setShowTransferDialog(false)
    setShowStopDialog(false)
    setPendingActiveTimer(null)
  }, [task?.id])

  // Load time entries on mount
  useEffect(() => {
    if (task?.id) {
      loadTimeEntries(task.id)
    }
  }, [task?.id, loadTimeEntries])

  // Setup socket listeners for real-time updates
  useEffect(() => {
    if (task?.id) {
      return setupSocketListeners(task.id)
    }
  }, [task?.id, setupSocketListeners])

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisChange = () => handleVisibilityChange(!document.hidden)
    document.addEventListener('visibilitychange', handleVisChange)
    return () => document.removeEventListener('visibilitychange', handleVisChange)
  }, [handleVisibilityChange])

  // Listen for global timer events to sync transfer dialog across tabs
  // Scenario: User has multiple tabs open, timer transfers between tickets
  // All tabs need to update their transfer dialog reference accordingly
  useEffect(() => {
    if (!task?.id || !currentUser?.id) return

    const handleGlobalTimerEvent = async (data: any) => {
      const eventTicketId = Number(data.ticketId || data.taskId)
      const isCurrentUserEvent = data.userId === currentUser.id
      
      // Only handle events for current user's timers
      if (!isCurrentUserEvent) return

      if (data.action === 'start') {
        // Timer started on a ticket
        if (eventTicketId === task.id) {
          // Timer is now on THIS ticket - close transfer dialog
          setShowTransferDialog(false)
          setPendingActiveTimer(null)
        } else {
          // Timer started on a DIFFERENT ticket - show/update transfer dialog
          // Fetch the ticket summary for the new active timer
          const activeTimerInfo: ActiveTimerInfo = {
            ticketId: eventTicketId,
            ticketSummary: data.ticketSummary || `Task #${eventTicketId}`,
            elapsedSeconds: 0,
            startTime: new Date(),
            timeEntryId: data.timeEntryId,
            statusId: data.statusId || 1, // Default to New if not provided in event
          }
          setPendingActiveTimer(activeTimerInfo)
          setShowTransferDialog(true)
        }
      }
      
      if (data.action === 'stop') {
        // Timer stopped - if it matches our pending timer, close dialog
        if (pendingActiveTimer && 
            Number(pendingActiveTimer.ticketId) === eventTicketId) {
          setShowTransferDialog(false)
          setPendingActiveTimer(null)
        }
      }
    }

    // Subscribe to global tasks channel for timer events
    pusherService.subscribe('tasks-channel', 'task:timer', handleGlobalTimerEvent)

    return () => {
      pusherService.unsubscribe('tasks-channel', 'task:timer', handleGlobalTimerEvent)
    }
  }, [task?.id, currentUser?.id, pendingActiveTimer])

  // Calculate completed time from entries
  useEffect(() => {
    if (!task) return
    const completedTime = timeEntries
      .filter(entry => entry.duration)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0)
    setCompletedTimeSeconds(completedTime)
  }, [task, timeEntries])

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------
  const handleStopClick = useCallback(() => {
    if (!task?.id || !isCurrentTaskTimerRunning) return
    setShowStopDialog(true)
  }, [task?.id, isCurrentTaskTimerRunning])

  // Admin Start Timer - check for active timer elsewhere first
  const handleStartClick = useCallback(async () => {
    if (!task?.id || isCurrentTaskTimerRunning) return
    
    try {
      // Check if user has an active timer on another ticket
      const activeTimer = await checkGlobalActiveTimer()
      
      if (activeTimer && Number(activeTimer.ticketId) !== task.id) {
        // Show transfer dialog
        setPendingActiveTimer(activeTimer)
        setShowTransferDialog(true)
      } else {
        // No active timer elsewhere - start directly
        const success = await startTimerOnView(task.id)
        if (success) {
          showToast({
            title: "Timer started",
            description: "Timer is now running. Status changed to In Progress.",
            type: "success",
          })
        } else {
          showToast({
            title: "Error",
            description: "Failed to start timer. Please try again.",
            type: "error",
          })
        }
      }
    } catch (error) {
      console.error('Error starting timer:', error)
      showToast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        type: "error",
      })
    }
  }, [task?.id, isCurrentTaskTimerRunning, checkGlobalActiveTimer, startTimerOnView, showToast])

  const handleStopWithNote = useCallback(async (note: string) => {
    if (!task?.id) return
    
    try {
      const result = await stopTimerWithNote(task.id, note)
      if (result && typeof result === 'object' && result.success) {
        markAsManuallyStoppedTicket(task.id)
        setShowStopDialog(false)
        
        // Show appropriate toast based on API response (status change handled by backend)
        showToast({
          title: "Timer stopped",
          description: result.statusChanged 
            ? "Time recorded with your note. Status changed to On Hold."
            : "Time recorded with your note.",
          type: "success",
        })
      } else {
        throw new Error('Failed to stop timer')
      }
    } catch (error) {
      console.error('Error stopping timer:', error)
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to stop timer",
        type: "error",
      })
    }
  }, [task?.id, stopTimerWithNote, markAsManuallyStoppedTicket, showToast])

  const handleTransfer = useCallback(async (note: string) => {
    if (!task?.id || !pendingActiveTimer) return
    
    try {
      const result = await transferTimerToTicket(
        pendingActiveTimer.ticketId,
        task.id,
        note
      )
      
      if (result.success) {
        setShowTransferDialog(false)
        setPendingActiveTimer(null)
        showToast({
          title: "Timer Updated",
          description: `Timer stopped from Ticket #${pendingActiveTimer.ticketId}. A new timer has started on this ticket.`,
          type: "success",
        })
      } else {
        throw new Error(result.error || 'Failed to transfer timer. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Error transferring timer:', error)
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transfer timer. Please refresh and try again.",
        type: "error",
      })
    }
  }, [task?.id, pendingActiveTimer, transferTimerToTicket, showToast])

  const handleTransferCancel = useCallback(() => {
    setShowTransferDialog(false)
    setPendingActiveTimer(null)
  }, [])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (!task) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="md" />
      </div>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="p-0">
        <div className="flex justify-between items-center p-4">
          <CardTitle>
            <div className="flex items-center">
              {isFetchingTimeEntries ? <Spinner size="sm" className="mr-2" /> : <Clock className="h-5 w-5 mr-2" />}
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className={compactMode ? 'px-2' : 'px-3 gap-2'}
              onClick={handleRefreshTimer}
              disabled={isFetchingTimeEntries || isRefreshing || isNavigating}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {!compactMode && <span>Refresh</span>}
            </Button>
            <TimerDrawer />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="px-4 pb-4 pt-0">
          {/* Timer Display */}
          <div 
            className={cn(
              "text-3xl font-mono font-semibold text-center mb-2",
              isFetchingTimeEntries || isNavigating ? "text-gray-300" : "text-primary"
            )}
            data-testid="timer-display"
          >
            {isCurrentTaskTimerRunning && isCurrentUserTimer && !isNavigating 
              ? formatDuration(localTimer) 
              : isFetchingTimeEntries || isNavigating 
                ? "--:--:--" 
                : "00:00:00"}
          </div>

          {/* Accrued Time */}
          <div className="flex justify-between items-center pb-2">
            <div className="text-sm">Accrued:</div>
            <div className={cn(
              "text-sm font-mono font-semibold",
              isFetchingTimeEntries || isNavigating ? "text-gray-300" : "text-primary"
            )}>
              {isFetchingTimeEntries || isNavigating ? "--:--:--" : formatDuration(accruedTimeSeconds)}
            </div>
          </div>
          
          <div className="space-y-2">
            {/* Status Alert */}
            <Alert className={cn(isCurrentTaskTimerRunning ? "bg-green-500" : "bg-blue-500", "text-white")}>
              <AlertDescription>
                {isCurrentTaskTimerRunning 
                  ? "Timer is running. Click Stop to end tracking (note required), or it will auto-stop when status changes to Closed or Archived." 
                  : isAdmin 
                    ? "Click Start Timer to begin tracking time on this ticket."
                    : "Timer starts automatically when you view a ticket."}
              </AlertDescription>
            </Alert>

            {/* Start/Stop Button */}
            {isCurrentTaskTimerRunning ? (
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600" 
                  onClick={handleStopClick}
                  disabled={!canControlTimer || isFetchingTimeEntries}
                  data-testid="stop-timer-button"
                >
                  <CircleStop className="mr-2 h-4 w-4" />
                  <span>Stop Timer</span>
                </Button>
              </div>
            ) : isAdmin && task.status.id !== TaskStatusType.Closed && task.status.id !== TaskStatusType.Archived && (
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600" 
                  onClick={handleStartClick}
                  disabled={isFetchingTimeEntries || isNavigating}
                >
                  <Play className="mr-2 h-4 w-4" />
                  <span>Start Timer</span>
                </Button>
              </div>
            )}

            {/* Closed Task Notice */}
            {task.status.id === TaskStatusType.Closed && (
              <p className="text-sm text-muted-foreground text-center py-1">
                Timer controls disabled - task is closed
              </p>
            )}
          </div>
        </div>
      </CardContent>

      {/* Timer Transfer Dialog */}
      {pendingActiveTimer && Number(pendingActiveTimer.ticketId) !== Number(task.id) && (
        <TimerTransferDialog
          open={showTransferDialog}
          activeTimer={pendingActiveTimer}
          currentTicketId={task.id}
          onTransfer={handleTransfer}
          onCancel={handleTransferCancel}
        />
      )}

      {/* Timer Stop Dialog */}
      <TimerStopDialog
        open={showStopDialog}
        ticketId={task.id}
        ticketSummary={task.summary || `Ticket #${task.id}`}
        elapsedTime={localTimer}
        onStop={handleStopWithNote}
        onCancel={() => setShowStopDialog(false)}
      />

      {/* Timer Continue Confirmation Dialog */}
      <TimerContinueDialog
        open={showInactivityDialog}
        ticketId={task.id}
        remainingSeconds={inactivityRemainingSeconds}
        onContinue={handleContinueWorking}
        onStop={() => {
          handleDismissInactivity()
          setShowStopDialog(true)
        }}
      />
    </Card>
  )
}

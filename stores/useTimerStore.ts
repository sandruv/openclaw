import { create } from 'zustand';
import socketService from '@/services/socketService';
import pusherService from '@/services/pusherService';
import { 
  startTimer, 
  stopTimer, 
  getTimeEntries, 
  trackTicketView, 
  endTicketView, 
  createManualTimeEntry, 
  validateTimerState,
  checkGlobalActiveTimer,
  transferTimer,
  startTimerOnView,
  stopTimerWithNote,
  ActiveTimerInfo,
  TransferTimerResponse
} from '@/services/timerService';
import { TimeEntry } from '@/types/tasks';

// Re-export types for consumers
export type { ActiveTimerInfo, TransferTimerResponse };

interface TimerState {
  // State
  isTimerRunning: boolean;
  localTimer: number;
  activeUserId: number | null;
  activeTicketId: number | null;
  activeTimeEntryId: number | null;
  timeEntries: TimeEntry[];
  lastSyncTime: number;
  isAutoTracking: boolean;
  isFetchingTimeEntries: boolean;
  _lastValidatedTimers: Map<number, number>; // Track when tickets were last validated
  
  // Global timer state (across all tickets)
  globalActiveTimer: ActiveTimerInfo | null;
  isCheckingGlobalTimer: boolean;
  
  // Actions
  startTimer: (ticketId: number, type?: 'manual' | 'automatic') => Promise<boolean>;
  stopTimer: (ticketId: number, note?: string) => Promise<boolean>;
  loadTimeEntries: (ticketId: number, isInitialLoad?: boolean) => Promise<void>;
  incrementTimer: () => void;
  resetTimer: () => void;
  startAutoTracking: (ticketId: number) => Promise<boolean>;
  stopAutoTracking: (ticketId: number) => Promise<boolean>;
  addManualTimeEntry: (ticketId: number, startTime: Date, endTime: Date, description?: string, agentId?: number) => Promise<boolean>;
  handleVisibilityChange: (isVisible: boolean) => void;
  setupSocketListeners: (ticketId: number) => () => void;
  
  // New actions for view-based timer
  checkGlobalActiveTimer: () => Promise<ActiveTimerInfo | null>;
  transferTimerToTicket: (fromTicketId: number, toTicketId: number, note: string) => Promise<TransferTimerResponse>;
  startTimerOnView: (ticketId: number, description?: string) => Promise<boolean>;
  stopTimerWithNote: (ticketId: number, note: string) => Promise<{ success: boolean; statusChanged?: boolean } | false>;
  clearGlobalActiveTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  // Initial state
  isTimerRunning: false,
  localTimer: 0,
  activeUserId: null,
  activeTicketId: null,
  activeTimeEntryId: null,
  timeEntries: [],
  lastSyncTime: 0,
  isAutoTracking: false,
  isFetchingTimeEntries: false,
  _lastValidatedTimers: new Map<number, number>(),
  
  // Global timer state
  globalActiveTimer: null,
  isCheckingGlobalTimer: false,
  
  // Action to start a timer manually
  startTimer: async (ticketId: number, type: 'manual' | 'automatic' = 'manual') => {
    try {
      const response = await startTimer(ticketId, type);
      
      if (response.status === 200 && response.data) {
        // Update state with time entry from response
        set({
          isTimerRunning: true,
          localTimer: 0,
          activeUserId: response.data.user_id,
          activeTicketId: ticketId,
          activeTimeEntryId: response.data.id,
          lastSyncTime: Date.now(),
        });
        
        // Instead of loading all time entries again, just add this entry to the existing list (avoid duplicates)
        set(state => {
          const exists = state.timeEntries.some(entry => entry.id === response.data.id);
          if (exists) return state;
          return { timeEntries: [...state.timeEntries, response.data] };
        });
        
        return true;
      }
      
      console.error('Failed to start timer:', response.message);
      return false;
    } catch (error) {
      console.error('Error starting timer:', error);
      return false;
    }
  },
  
  // Action to stop the current timer
  stopTimer: async (ticketId: number, note?: string) => {
    try {
      const { activeTimeEntryId, timeEntries } = get();
      const response = await stopTimer(ticketId, note, activeTimeEntryId || undefined);
      
      if (response.status === 200) {
        // Reset timer state
        set({
          isTimerRunning: false,
          localTimer: 0,
          activeUserId: null,
          activeTicketId: null,
          activeTimeEntryId: null,
        });
        
        // Instead of fetching all time entries again, just update the stopped one in the existing list
        if (activeTimeEntryId && response.data) {
          set(state => ({
            timeEntries: state.timeEntries.map(entry => 
              entry.id === activeTimeEntryId ? response.data : entry
            )
          }));
        }
        return true;
      }
      
      console.error('Failed to stop timer:', response.message);
      return false;
    } catch (error) {
      console.error('Error stopping timer:', error);
      return false;
    }
  },
  
  // Property moved to initial state
  
  // Action to load time entries for a ticket
  loadTimeEntries: async (ticketId: number, isInitialLoad = true) => {
    try {
      set({ isFetchingTimeEntries: true });
      
      // Only validate timer state on initial load AND if we haven't validated recently
      const lastValidatedTime = get()._lastValidatedTimers.get(ticketId) || 0;
      const now = Date.now();
      const fiveMinutesAgo = now - (5 * 60 * 1000); // Only validate once per 5 minutes
      
      if (isInitialLoad && lastValidatedTime < fiveMinutesAgo) {
        try {
          console.log(`Validating timer state for ticket #${ticketId} on initial load`);
          
          // Mark as validated immediately to prevent duplicate calls
          get()._lastValidatedTimers.set(ticketId, now);
          
          const validationResponse = await validateTimerState(ticketId);
          
          if (validationResponse.status === 200 && validationResponse.data?.hadInconsistency) {
            console.log(`Fixed inconsistent timer state: stopped ${validationResponse.data.stoppedTimers} timer(s) for status ${validationResponse.data.statusName}`);
          }
        } catch (validationError) {
          // Don't let validation errors block loading the time entries
          console.error('Error validating timer state:', validationError);
        }
      }
      
      const response = await getTimeEntries(ticketId);
      
      if (response.status === 200 && response.data) {
        set({ timeEntries: response.data });
        
        // Check if there's an active timer for this ticket
        const activeTimeEntry = response.data.find(entry => !entry.end_time && entry.is_active);
        if (activeTimeEntry) {
          const startTime = new Date(activeTimeEntry.start_time).getTime();
          const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
          
          set({
            isTimerRunning: true,
            localTimer: elapsedSeconds,
            activeUserId: activeTimeEntry.user_id,
            activeTicketId: ticketId,
            activeTimeEntryId: activeTimeEntry.id,
            lastSyncTime: Date.now(),
            isAutoTracking: activeTimeEntry.entry_type === 'automatic',
          });
        }
      }

      set({ isFetchingTimeEntries: false });
    } catch (error) {
      console.error('Error loading time entries:', error);
      set({ isFetchingTimeEntries: false });
    }
  },
  
  // Action to increment the timer (called every second)
  incrementTimer: () => {
    if (get().isTimerRunning) {
      set(state => ({ localTimer: state.localTimer + 1 }));
    }
  },
  
  // Action to reset the timer state
  resetTimer: () => {
    set({
      isTimerRunning: false,
      localTimer: 0,
      activeUserId: null,
      activeTicketId: null,
      activeTimeEntryId: null,
      isAutoTracking: false,
    });
  },
  
  // Action to start automatic time tracking when viewing a ticket
  startAutoTracking: async (ticketId: number) => {
    try {
      const response = await trackTicketView(ticketId);
      
      if (response.status === 200 && response.data?.timeEntry) {
        set({
          isTimerRunning: true,
          isAutoTracking: true,
          localTimer: 0,
          activeUserId: response.data.timeEntry.user_id,
          activeTicketId: ticketId,
          activeTimeEntryId: response.data.timeEntry.id,
          lastSyncTime: Date.now(),
        });
        return true;
      }
      
      console.error('Failed to start auto-tracking:', response.message);
      return false;
    } catch (error) {
      console.error('Error starting auto-tracking:', error);
      return false;
    }
  },
  
  // Action to stop automatic time tracking when leaving a ticket
  stopAutoTracking: async (ticketId: number) => {
    // Only proceed if we're actually auto-tracking
    if (!get().isAutoTracking) return false;
    
    try {
      const { activeTimeEntryId } = get();
      const response = await endTicketView(ticketId);
      
      if (response.status === 200) {
        set({
          isTimerRunning: false,
          isAutoTracking: false,
          localTimer: 0,
          activeUserId: null,
          activeTicketId: null,
          activeTimeEntryId: null,
        });
        
        // Update the existing time entry in the list instead of reloading all entries
        if (activeTimeEntryId && response.data?.updatedTimeEntry) {
          set(state => ({
            timeEntries: state.timeEntries.map(entry => {
              // Only replace if we have a valid time entry from the response
              if (entry.id === activeTimeEntryId && response.data.updatedTimeEntry) {
                return response.data.updatedTimeEntry;
              }
              return entry;
            })
          }));
        }
        return true;
      }
      
      console.error('Failed to stop auto-tracking:', response.message);
      return false;
    } catch (error) {
      console.error('Error stopping auto-tracking:', error);
      return false;
    }
  },

  // Action to add a manual time entry
  addManualTimeEntry: async (ticketId: number, startTime: Date, endTime: Date, description?: string, agentId?: number) => {
    try {
      const response = await createManualTimeEntry(ticketId, startTime, endTime, description, agentId);
      // Assuming 201 for created or 200 if API returns the entry with 200
      if ((response.status === 201 || response.status === 200) && response.data) {
        // Refresh time entries to get the updated list
        await get().loadTimeEntries(ticketId);
        return true;
      }
      console.error('Failed to add manual time entry:', response.message);
      return false;
    } catch (error) {
      console.error('Error adding manual time entry:', error);
      return false;
    }
  },
  
  // Handle visibility change for auto-tracking (pause when tab is hidden)
  handleVisibilityChange: (isVisible: boolean) => {
    const { isAutoTracking, activeTicketId } = get();
    
    // Only handle visibility change for auto-tracking
    if (!isAutoTracking || !activeTicketId) return;
    
    if (!isVisible) {
      // Tab hidden, pause tracking
      get().stopAutoTracking(activeTicketId);
    } else {
      // Tab visible again, resume tracking
      get().startAutoTracking(activeTicketId);
    }
  },
  
  // Set up socket and Pusher listeners for real-time updates
  setupSocketListeners: (ticketId: number) => {
    // Listen for timer events - both from socket and Pusher for backward compatibility
    const handleTimerEvent = (data: any) => {
      console.log('Timer event received:', data);
      if ((data.ticketId === ticketId) || (data.taskId === ticketId)) {
        if (data.action === 'start') {
          // Only update if it's not the current user (they already have local state)
          const currentUser = get().activeUserId;
          if (currentUser !== data.userId) {
            console.log('Timer started by another user, updating state');
            set({
              isTimerRunning: true,
              activeUserId: data.userId,
              activeTicketId: data.ticketId || data.taskId,
              activeTimeEntryId: data.timeEntryId,
              isAutoTracking: data.type === 'automatic',
            });
          }
        } else if (data.action === 'stop') {
          // Update the timer state if it was stopped by another user
          console.log('Timer stopped by socket event, updating state');
          
          // Update the existing time entry in the list if it's available in the data
          if (data.timeEntryId && data.updatedTimeEntry) {
            set(state => ({
              timeEntries: state.timeEntries.map(entry => 
                entry.id === data.timeEntryId ? data.updatedTimeEntry : entry
              ),
              isTimerRunning: false,
              localTimer: 0,
              activeUserId: null,
              activeTicketId: null,
              activeTimeEntryId: null,
              isAutoTracking: false,
            }));
          } else {
            // If we don't have the updated entry, just reset the timer state
            set(state => {
              if (state.isTimerRunning && 
                  (state.activeTicketId === data.ticketId || state.activeTicketId === data.taskId)) {
                return {
                  isTimerRunning: false,
                  localTimer: 0,
                  activeUserId: null,
                  activeTicketId: null,
                  activeTimeEntryId: null,
                  isAutoTracking: false,
                };
              }
              return state;
            });
            
            // Only refresh time entries if we don't have the updated entry
            get().loadTimeEntries(ticketId, false); // Pass false to avoid validation
          }
        }
      }
    };
    
    // Add Pusher event listeners for both ticket-specific and global channels
    const ticketChannel = pusherService.subscribe(`ticket-${ticketId}`, 'ticket:timer', handleTimerEvent);
    const tasksChannel = pusherService.subscribe('tasks-channel', 'task:timer', handleTimerEvent);
    
    // Return cleanup function
    return () => {
      pusherService.unsubscribe(`ticket-${ticketId}`, 'ticket:timer', handleTimerEvent);
      pusherService.unsubscribe('tasks-channel', 'task:timer', handleTimerEvent);
    };
  },
  
  // Check if user has an active timer on any ticket (global check)
  checkGlobalActiveTimer: async () => {
    try {
      set({ isCheckingGlobalTimer: true });
      const response = await checkGlobalActiveTimer();
      
      if (response.hasActiveTimer && response.activeTimer) {
        set({ globalActiveTimer: response.activeTimer });
        return response.activeTimer;
      }
      
      set({ globalActiveTimer: null });
      return null;
    } catch (error: any) {
      // Silently handle 401 errors - they're expected during auth initialization
      if (error?.response?.status !== 401) {
        console.error('Error checking global active timer:', error);
      }
      set({ globalActiveTimer: null });
      return null;
    } finally {
      set({ isCheckingGlobalTimer: false });
    }
  },
  
  // Transfer timer from one ticket to another (with required note)
  transferTimerToTicket: async (fromTicketId: number, toTicketId: number, note: string) => {
    try {
      const response = await transferTimer(fromTicketId, toTicketId, note);
      
      if (response.success) {
        // Update local state for the new ticket
        if (response.newEntry) {
          set({
            isTimerRunning: true,
            localTimer: 0,
            activeTicketId: toTicketId,
            activeTimeEntryId: response.newEntry.id,
            lastSyncTime: Date.now(),
            globalActiveTimer: null, // Clear global timer since we're now on this ticket
          });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error transferring timer:', error);
      return { success: false, error: 'Failed to transfer timer. Please refresh and try again.' };
    }
  },
  
  // Start timer when viewing a ticket
  startTimerOnView: async (ticketId: number, description?: string) => {
    try {
      const response = await startTimerOnView(ticketId, description);
      
      if (response.status === 200 && response.data?.timeEntry) {
        const { timeEntry } = response.data;
        
        set({
          isTimerRunning: true,
          localTimer: 0,
          activeUserId: timeEntry.user_id,
          activeTicketId: ticketId,
          activeTimeEntryId: timeEntry.id,
          lastSyncTime: Date.now(),
          globalActiveTimer: null, // Clear global timer
        });
        
        // Add to time entries list (avoid duplicates)
        set(state => {
          const exists = state.timeEntries.some(entry => entry.id === timeEntry.id);
          if (exists) return state;
          return { timeEntries: [...state.timeEntries, timeEntry] };
        });
        
        return true;
      }
      
      console.error('Failed to start timer on view:', response.message);
      return false;
    } catch (error) {
      console.error('Error starting timer on view:', error);
      return false;
    }
  },
  
  // Stop timer with required note (creates private note activity)
  stopTimerWithNote: async (ticketId: number, note: string) => {
    try {
      const { activeTimeEntryId } = get();
      const response = await stopTimerWithNote(ticketId, note, activeTimeEntryId || undefined);
      
      if (response.status === 200) {
        // Reset timer state
        set({
          isTimerRunning: false,
          localTimer: 0,
          activeUserId: null,
          activeTicketId: null,
          activeTimeEntryId: null,
        });
        
        // Update time entry in list
        if (activeTimeEntryId && response.data) {
          set(state => ({
            timeEntries: state.timeEntries.map(entry => 
              entry.id === activeTimeEntryId ? response.data : entry
            )
          }));
        }
        
        // Return success with statusChanged info from API response
        // API returns extended TimeEntry with statusChanged field
        const responseData = response.data as { statusChanged?: boolean } | null;
        return { 
          success: true, 
          statusChanged: responseData?.statusChanged || false 
        };
      }
      
      console.error('Failed to stop timer with note:', response.message);
      return false;
    } catch (error) {
      console.error('Error stopping timer with note:', error);
      return false;
    }
  },
  
  // Clear global active timer state
  clearGlobalActiveTimer: () => {
    set({ globalActiveTimer: null });
  },
}));

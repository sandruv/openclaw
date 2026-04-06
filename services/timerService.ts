import { apiRequest } from './api/clientConfig';
import { ApiResponse } from '@/types/api';
import { TimeEntry } from '@/types/tasks';

// Types for active timer and transfer operations
export interface ActiveTimerInfo {
  ticketId: number;
  ticketSummary: string;
  startTime: Date;
  elapsedSeconds: number;
  timeEntryId: number;
  statusId: number; // Ticket status - needed for priority logic
}

export interface ActiveTimerResponse {
  hasActiveTimer: boolean;
  activeTimer: ActiveTimerInfo | null;
}

export interface TransferTimerResponse {
  success: boolean;
  stoppedEntry?: {
    id: number;
    duration: number;
  };
  newEntry?: {
    id: number;
    startTime: Date;
  };
  error?: string;
}

/**
 * Start a timer for a ticket
 * @param ticketId - The ID of the ticket to start timing
 * @param type - The type of time entry (manual or automatic)
 * @returns Promise with the API response
 */
export async function startTimer(
  ticketId: number, 
  type: 'manual' | 'automatic' = 'manual'
): Promise<ApiResponse<TimeEntry>> {
  return apiRequest<ApiResponse<TimeEntry>>(`/tickets/${ticketId}/timer`, {
    method: 'POST',
    data: JSON.stringify({ type }),
  });
}

/**
 * Stop an active timer for a ticket
 * @param ticketId - The ID of the ticket to stop timing
 * @param note - Optional note about the time entry
 * @param timeEntryId - Optional specific time entry ID to stop
 * @returns Promise with the API response
 */
export async function stopTimer(
  ticketId: number, 
  note?: string,
  timeEntryId?: number
): Promise<ApiResponse<TimeEntry>> {
  return apiRequest<ApiResponse<TimeEntry>>(`/tickets/${ticketId}/timer`, {
    method: 'PUT',
    data: JSON.stringify({ 
      note,
      timeEntryId,
    }),
  });
}

/**
 * Delete a time entry
 * @param ticketId - The ID of the ticket the time entry belongs to
 * @param entryId - The ID of the time entry to delete
 * @returns Promise with the API response
 */
export async function deleteTimeEntry(
  ticketId: number,
  entryId: number
): Promise<ApiResponse<{id: number, ticketId: number}>> {
  return apiRequest<ApiResponse<{id: number, ticketId: number}>>(`/tickets/${ticketId}/timer`, {
    method: 'DELETE',
    data: JSON.stringify({ entryId }),
  });
}

/**
 * Get all time entries for a ticket
 * @param ticketId - The ID of the ticket to get time entries for
 * @returns Promise with the API response
 */
export async function getTimeEntries(ticketId: number): Promise<ApiResponse<TimeEntry[]>> {
  return apiRequest<ApiResponse<TimeEntry[]>>(`/tickets/${ticketId}/timer`);
}

/**
 * Create a manual time entry for a ticket
 * @param ticketId - The ID of the ticket
 * @param startTime - The start date and time of the entry
 * @param endTime - The end date and time of the entry
 * @param description - Optional description for the time entry
 * @param agentId - Optional agent ID to log time for (defaults to current user on backend)
 * @returns Promise with the API response containing the created TimeEntry
 */
export async function createManualTimeEntry(
  ticketId: number,
  startTime: Date,
  endTime: Date,
  description?: string,
  agentId?: number
): Promise<ApiResponse<TimeEntry>> {
  return apiRequest<ApiResponse<TimeEntry>>(`/tickets/${ticketId}/timer`, {
    method: 'POST',
    data: JSON.stringify({
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description: description || null,
      entry_type: 'manual', // Explicitly set entry_type
      agent_id: agentId || null, // Optional agent ID for logging time on behalf of another user
    }),
  });
}

/**
 * Track that a user has started viewing a ticket (automatic time tracking)
 * @param ticketId - The ID of the ticket being viewed
 * @returns Promise with the API response
 */
export async function trackTicketView(ticketId: number): Promise<ApiResponse<{ timeEntry: TimeEntry }>> {
  return apiRequest<ApiResponse<{ timeEntry: TimeEntry }>>(`/tickets/${ticketId}/view`, {
    method: 'POST',
  });
}

/**
 * Track that a user has stopped viewing a ticket (automatic time tracking)
 * @param ticketId - The ID of the ticket being viewed
 * @returns Promise with the API response
 */
export async function endTicketView(ticketId: number): Promise<ApiResponse<{ updatedTimeEntry: TimeEntry | null }>> {
  return apiRequest<ApiResponse<{ updatedTimeEntry: TimeEntry | null }>>(`/tickets/${ticketId}/view`, {
    method: 'PUT',
  });
}

/**
 * Validate and fix inconsistent timer states for a ticket
 * Checks if there are any active timers when the ticket status is not 'In Progress'
 * and stops them if found
 * 
 * @param ticketId - The ID of the ticket to validate timer state for
 * @returns Promise with the API response containing validation results
 */
export async function validateTimerState(ticketId: number | string): Promise<ApiResponse<{
  hadInconsistency: boolean;
  stoppedTimers: number;
  statusName: string | null;
}>> {
  return apiRequest<ApiResponse<{
    hadInconsistency: boolean;
    stoppedTimers: number;
    statusName: string | null;
  }>>(`/tickets/${ticketId}/validate-timer`);
}

/**
 * Check if the current user has an active timer on any ticket
 * @returns Promise with the active timer info if any exists
 */
export async function checkGlobalActiveTimer(): Promise<ActiveTimerResponse> {
  const response = await apiRequest<ActiveTimerResponse>('/timer/active');
  
  // Convert startTime string to Date if present
  if (response.activeTimer?.startTime) {
    response.activeTimer.startTime = new Date(response.activeTimer.startTime);
  }
  
  return response;
}

/**
 * Transfer timer from one ticket to another
 * Stops the timer on the source ticket (with a required note) and starts on the destination ticket
 * @param fromTicketId - The ID of the ticket to stop the timer on
 * @param toTicketId - The ID of the ticket to start the timer on
 * @param note - Required note about work done on the source ticket (becomes a private note)
 * @returns Promise with the transfer result
 */
export async function transferTimer(
  fromTicketId: number,
  toTicketId: number,
  note: string
): Promise<TransferTimerResponse> {
  const response = await apiRequest<TransferTimerResponse>('/timer/transfer', {
    method: 'POST',
    data: JSON.stringify({
      fromTicketId,
      toTicketId,
      note
    })
  });
  
  // Convert startTime string to Date if present
  if (response.newEntry?.startTime) {
    response.newEntry.startTime = new Date(response.newEntry.startTime);
  }
  
  return response;
}

// Response type for startTimerOnView
export interface StartTimerOnViewResponse {
  timeEntry: TimeEntry;
  statusChanged: boolean;
  newStatusId: number;
}

/**
 * Start timer when viewing a ticket
 * @param ticketId - The ID of the ticket being viewed
 * @param description - Optional description for the time entry
 * @returns Promise with the API response including timeEntry and status change info
 */
export async function startTimerOnView(
  ticketId: number,
  description?: string
): Promise<ApiResponse<StartTimerOnViewResponse>> {
  return apiRequest<ApiResponse<StartTimerOnViewResponse>>(`/tickets/${ticketId}/timer`, {
    method: 'POST',
    data: JSON.stringify({ 
      type: 'view',
      description 
    }),
  });
}

/**
 * Stop timer with a required note (for manual stop)
 * @param ticketId - The ID of the ticket to stop the timer on
 * @param note - Required note about work done (becomes a private note activity)
 * @param timeEntryId - Optional specific time entry ID to stop
 * @returns Promise with the API response
 */
export async function stopTimerWithNote(
  ticketId: number,
  note: string,
  timeEntryId?: number
): Promise<ApiResponse<TimeEntry>> {
  return apiRequest<ApiResponse<TimeEntry>>(`/tickets/${ticketId}/timer`, {
    method: 'PUT',
    data: JSON.stringify({ 
      note,
      timeEntryId,
      createPrivateNote: true  // Flag to create a private note activity
    }),
  });
}

export interface BatchActiveTimerInfo {
  ticketId: number;
  elapsedSeconds: number;
  timeEntryId: number;
}

/**
 * Fetch active timers for multiple tickets in a single request
 * @param ticketIds - Array of ticket IDs to check for active timers
 * @returns Promise with a map of ticketId to active timer info
 */
export async function getBatchActiveTimers(
  ticketIds: number[]
): Promise<ApiResponse<Record<number, BatchActiveTimerInfo>>> {
  // Convert array to comma-separated string for query params
  const idsParam = ticketIds.join(',');
  return apiRequest<ApiResponse<Record<number, BatchActiveTimerInfo>>>(`/timer/multi-check?ids=${idsParam}`, {
    method: 'GET',
  });
}
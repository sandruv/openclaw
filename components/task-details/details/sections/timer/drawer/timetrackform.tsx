'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, List, Clock, Loader2, ChevronDown, Check, Search } from 'lucide-react'
import { useTimerStore } from '@/stores/useTimerStore'
import { useTaskDetailsStore } from '@/stores/useTaskDetailsStore'
import { useToast } from '@/components/ui/toast-provider'
import { useSessionStore } from '@/stores/useSessionStore'
import { useDropdownStore } from '@/stores/useDropdownStore'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RoleProvider } from '@/lib/roleProvider'

// Feature flag: Set to true to allow all users to use manual time entry
const ALLOW_ALL_USERS_MANUAL_ENTRY = false;

export function TimetrackForm() {
  const addManualTimeEntry = useTimerStore((state) => state.addManualTimeEntry);
  const loadTimeEntries = useTimerStore((state) => state.loadTimeEntries);
  const ticketId = useTaskDetailsStore((state) => state.task?.id); // Get ticket ID from the task object
  const { showToast } = useToast();
  const { user } = useSessionStore();
  const { agents, fetchAgents, isLoading: isLoadingAgents } = useDropdownStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agentSearch, setAgentSearch] = useState('');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState<string>('09:00')
  const [endTime, setEndTime] = useState<string>('17:00')
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState<string>('')
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false)
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false)
  const [showEndDateInput, setShowEndDateInput] = useState<boolean>(false)
  const [calculatedDuration, setCalculatedDuration] = useState<string>('0.00 hrs')

  // Load agents on initial render and set default to current user
  useEffect(() => {
    if (agents.length === 0) {
      fetchAgents().catch((error) => {
        console.error('Error fetching agents:', error);
      });
    }
  }, [agents.length, fetchAgents]);

  // Set default agent to current user when user is loaded
  useEffect(() => {
    if (user?.id && !selectedAgent) {
      setSelectedAgent(user.id.toString());
    }
  }, [user?.id, selectedAgent]);

  useEffect(() => {
    if (date && startTime && endTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (timeRegex.test(startTime) && timeRegex.test(endTime)) {
        const crossesMidnight = endTime < startTime;
        setShowEndDateInput(crossesMidnight);
        let newEndDateCandidate = new Date(date.getTime()); // Clone startDate
        if (crossesMidnight) {
          newEndDateCandidate.setDate(newEndDateCandidate.getDate() + 1);
        }
        setEndDate(newEndDateCandidate);
      } else {
        // If times are not valid, don't show end date input, and align endDate with date
        setShowEndDateInput(false);
        setEndDate(date ? new Date(date.getTime()) : undefined);
      }
    } else if (date) {
      // If only date is present, ensure endDate is aligned and hide input
      setShowEndDateInput(false);
      setEndDate(new Date(date.getTime()));
    } else {
      // If date is cleared, clear endDate and hide input
      setShowEndDateInput(false);
      setEndDate(undefined);
    }
  }, [date, startTime, endTime]);

  useEffect(() => {
    if (date && startTime && endTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (timeRegex.test(startTime) && timeRegex.test(endTime)) {
        const finalEndDate = showEndDateInput && endDate ? endDate : date;
        if (!finalEndDate) {
            setCalculatedDuration('0.00 hrs');
            return;
        }

        const startHours = parseInt(startTime.split(':')[0]);
        const startMinutes = parseInt(startTime.split(':')[1]);
        const endHours = parseInt(endTime.split(':')[0]);
        const endMinutes = parseInt(endTime.split(':')[1]);

        const startFullDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHours, startMinutes);
        const endFullDateTime = new Date(finalEndDate.getFullYear(), finalEndDate.getMonth(), finalEndDate.getDate(), endHours, endMinutes);

        if (endFullDateTime.getTime() > startFullDateTime.getTime()) {
          const diffMs = endFullDateTime.getTime() - startFullDateTime.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          setCalculatedDuration(`${diffHours.toFixed(2)} hrs`);
        } else {
          setCalculatedDuration('0.00 hrs');
        }
      } else {
        setCalculatedDuration('0.00 hrs'); // Invalid time format
      }
    } else {
      setCalculatedDuration('0.00 hrs'); // Incomplete inputs
    }
  }, [date, startTime, endTime, endDate, showEndDateInput]);

  // Check if user is admin
  const isAdmin = user ? RoleProvider.isAdmin({ 
    id: user.id, 
    role_id: user.role_id ? Number(user.role_id) : undefined 
  }) : false;

  // Restrict manual time entry to admins only (unless feature flag is enabled)
  if (!ALLOW_ALL_USERS_MANUAL_ENTRY && !isAdmin) {
    return null;
  }

  const filteredAgents = agents.filter(agent =>
    agent.label.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      console.error("Start date and times are required.");
      // Add user feedback here, e.g., toast notification
      return;
    }

    const effectiveEndDate = showEndDateInput && endDate ? endDate : date; // Use date if end date input is hidden or endDate not set

    const startHours = parseInt(startTime.split(':')[0]);
    const startMinutes = parseInt(startTime.split(':')[1]);
    const endHours = parseInt(endTime.split(':')[0]);
    const endMinutes = parseInt(endTime.split(':')[1]);

    const startDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHours, startMinutes);
    const endDateTime = new Date(effectiveEndDate.getFullYear(), effectiveEndDate.getMonth(), effectiveEndDate.getDate(), endHours, endMinutes);

    if (!ticketId) {
      console.error("No active ticket ID found. Cannot save manual time log.");
      // Optionally, show a user-facing error message (e.g., toast)
      return;
    }

    console.log("Submitting manual time log:", {
      ticketId,
      startDateTime,
      endDateTime,
      description,
      raw: {
        date: date ? format(date, "yyyy-MM-dd") : undefined,
        startTime,
        endTime,
        endDate: effectiveEndDate ? format(effectiveEndDate, "yyyy-MM-dd") : undefined,
      }
    });

    const saveEntry = async () => {
      setIsSubmitting(true);
      if (!ticketId) {
        console.error("No active ticket ID found. Cannot save manual time log.");
        // TODO: Show user-facing error message (e.g., toast)
        return;
      }
      try {
        // Use selected agent or fallback to current user
        const agentId = selectedAgent ? Number(selectedAgent) : user?.id;
        const success = await addManualTimeEntry(ticketId, startDateTime, endDateTime, description, agentId);
        if (success) {
          console.log('Manual time entry saved successfully');
          showToast({ title: 'Success', description: 'Manual time log saved.', type: 'success' });
          // loadTimeEntries(ticketId); // Already called within addManualTimeEntry in the store
          // Reset form (optional)
          setDate(new Date());
          setStartTime('09:00');
          setEndTime('17:00');
          setEndDate(new Date());
          setDescription('');
        } else {
          console.error('Failed to save manual time entry via store action.');
          showToast({ title: 'Error', description: 'Failed to save time log. Please try again.', type: 'error' });
        }
      } catch (error) {
        console.error('Error submitting manual time entry:', error);
        showToast({ title: 'Error', description: 'An unexpected error occurred. Please try again.', type: 'error' });
      } finally {
        setIsSubmitting(false);
      }
    };

    saveEntry();

    // Keep this log for now to see what would be sent, can be removed later
    console.log("Data submitted for saving:", {
      startDateTime,
      endDateTime,
      description,
      raw: {
        date: date ? format(date, "yyyy-MM-dd") : undefined,
        startTime,
        endTime,
        endDate: effectiveEndDate ? format(effectiveEndDate, "yyyy-MM-dd") : undefined,
      }
    });
    // Reset form (optional)
    // setDate(new Date());
    // setStartTime('09:00');
    // setEndTime('17:00');
    // setEndDate(new Date());
    // setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[105px] space-y-2 mb-3 border p-3 rounded-md overflow-x-auto styled-scrollbar bg-gray-90">
      <div className="flex items-center space-x-2">
        <Popover open={isStartDatePickerOpen} onOpenChange={setIsStartDatePickerOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "h-8 text-xs w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {date ? format(date, "PPP") : <span>Pick a start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-3"
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="h-8 text-xs w-full focus-visible:ring-green-500"
          disabled={isSubmitting}
          aria-label="Start Time"
        />
        <span className="text-muted-foreground text-xs mx-1 self-center">-</span>
        <Input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="h-8 text-xs w-full focus-visible:ring-green-500"
          disabled={isSubmitting}
          aria-label="End Time"
        />
        {showEndDateInput && (
          <Popover open={isEndDatePickerOpen} onOpenChange={setIsEndDatePickerOpen} modal={true}>
            <PopoverTrigger asChild disabled={isSubmitting}>
              <Button
                variant={"outline"}
                className={cn(
                  "h-8 text-xs w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[100]" align="start" sideOffset={4}>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                className="p-3"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <List className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <Textarea
          placeholder="Notes (e.g. task details, comments)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-8 text-xs resize-none min-h-[2.4rem] flex-grow focus-visible:ring-green-500"
          disabled={isSubmitting}
          aria-label="Description"
        />
        <div className="flex items-center text-xs text-muted-foreground self-center mx-2 whitespace-nowrap tabular-nums">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{calculatedDuration}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex-grow">
          <DropdownMenu open={isAgentDropdownOpen} onOpenChange={(open) => {
            setIsAgentDropdownOpen(open);
            if (!open) setAgentSearch('');
          }}>
            <DropdownMenuTrigger asChild disabled={isLoadingAgents || isSubmitting}>
              <Button
                variant="outline"
                className="w-full h-9 justify-between text-xs"
                disabled={isLoadingAgents || isSubmitting}
              >
                <span className={!selectedAgent ? 'text-muted-foreground' : ''}>
                  {isLoadingAgents ? 'Loading...' : (agents.find(a => a.value === selectedAgent)?.label || 'Select Agent')}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-0" align="start">
              <div className="flex items-center border-b p-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="flex-grow border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-2 text-xs"
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto p-1 styled-scrollbar">
                {filteredAgents.length === 0 ? (
                  <div className="py-6 px-2 text-center text-sm text-muted-foreground">
                    No agents found
                  </div>
                ) : (
                  filteredAgents.map((agent) => (
                    <div
                      key={agent.value}
                      className={cn(
                        "flex items-center px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        selectedAgent === agent.value && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        setSelectedAgent(agent.value);
                        setIsAgentDropdownOpen(false);
                        setAgentSearch('');
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedAgent === agent.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-xs">{agent.label}</span>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button type="submit" size="sm" className="h-9 w-24 text-xs px-3 py-1 bg-green-500 hover:bg-green-600 text-white" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
        </Button>
      </div>
    </form>
  )
}

import { useEffect } from "react"
import { Combobox } from "@/components/ui/combobox"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { Loader2 } from "lucide-react"

interface AssigneeFilterProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function AssigneeFilter({ value, onValueChange, className }: AssigneeFilterProps) {
  const { agents, fetchAgents, isLoading: isLoadingAgents } = useDropdownStore()

  // Load initial agents on mount (only if not already loaded)
  useEffect(() => {
    if (agents.length === 0) {
      fetchAgents() // Agents are always client_id=1, cached in store
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  return (
    <div className="relative">
      {isLoadingAgents && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      )}
      <Combobox
        options={agents}
        value={value}
        onValueChange={onValueChange}
        placeholder="By Assignee"
        emptyMessage="No assignees found"
        className={className}
        includeUnselect={true}
        disabled={isLoadingAgents}
      />
    </div>
  )
}

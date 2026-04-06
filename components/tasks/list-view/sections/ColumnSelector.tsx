import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings2 } from "lucide-react"
import { useTasksStore } from "@/stores/useTasksStore"
import { useSettingsStore } from "@/stores/useSettingsStore"

const defaultColumns = {
  summary: true,
  type: true,
  priority: true,
  impact: true,
  client: true,
  assignee: true,
  created_by: true,
  created_date: false,
  updated_date: false,
  viewers: true,
  running_time: false
}

export type ColumnVisibility = typeof defaultColumns

export function ColumnSelector() {
  const { columns, toggleColumn } = useTasksStore()
  const { compactMode } = useSettingsStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {!compactMode && <span>Columns</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={-40} align="end" className="w-[200px] p-2">
        <div className="space-y-1">
          {Object.entries(defaultColumns).map(([key]) => (
            <label
              key={key}
              className="flex items-center space-x-2 px-2 py-2 hover:bg-muted rounded cursor-pointer"
            >
              <Checkbox
                checked={columns[key as keyof ColumnVisibility]}
                onCheckedChange={() => toggleColumn(key as keyof ColumnVisibility)}
              />
              <span className="text-sm capitalize">
                {key === 'created_by' ? 'Created by' : 
                 key === 'running_time' ? 'Running time' : 
                 key.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

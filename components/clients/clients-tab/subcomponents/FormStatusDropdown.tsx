import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CLIENT_STATUS_COLORS } from "@/constants/colors"

interface FormStatusDropdownProps {
  value: number
  onChange: (field: string, value: any) => void
  disabled?: boolean
  errors?: any
}

export function FormStatusDropdown({ value, onChange, disabled, errors }: FormStatusDropdownProps) {
  // Status ID to name/color mapping
  const statusMap = {
    1: { name: 'inactive', color: CLIENT_STATUS_COLORS['inactive'] },
    2: { name: 'pending', color: CLIENT_STATUS_COLORS['pending'] },
    3: { name: 'active', color: CLIENT_STATUS_COLORS['active'] }
  }
  
  const statusOptions = Object.entries(statusMap).map(([id, data]) => ({
    value: id,
    label: data.name.charAt(0).toUpperCase() + data.name.slice(1), // Capitalize first letter
    color: data.color
  }))
  
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="status" className="text-sm font-medium">
          Client Status
        </Label>
        <div className="relative mt-1">
          <Select
            value={String(value)}
            onValueChange={(newValue) => onChange('status_id', parseInt(newValue))}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select client status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${option.color}`}></span>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {errors?.status_id && <p className="text-sm font-medium text-red-500">{errors.status_id}</p>}
    </div>
  )
}

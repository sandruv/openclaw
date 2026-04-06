'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { ComboboxApi } from "@/components/ui/combobox-api"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { usePermissions } from "@/contexts/PermissionsContext"
import { cn } from "@/lib/utils"

interface UserFormData {
  role_id: number
  sophistication_id: number
  is_user_vip: boolean
  client_id: number
  password?: string
}

interface AdvancedInformationProps {
  formData: UserFormData
  errors: any
  isSubmitting: boolean
  onChange: (field: keyof UserFormData, value: string | number) => void
  onRoleChange: (roleId: string) => void
  onSophisticationChange: (sophisticationId: number) => void
  onVipChange: (value: boolean) => void
  clients: ComboboxOption[]
  onClientChange: (clientId: string) => void
}

export function AdvancedInformation({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange,
  onRoleChange,
  onSophisticationChange,
  onVipChange,
  clients,
  onClientChange
}: AdvancedInformationProps) {
  const { roles, fetchRoles, isLoading, searchClients, isSearchingClients } = useDropdownStore()
  const { hasPermission } = usePermissions()
  
  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Filter roles based on user permissions
  const filteredRoles = roles.filter(role => {
    const roleId = parseInt(role.value)
    
    // Always allow Agent (1), Client User (2), and Internal User (4)
    const standardRoles = [1, 2, 4]
    
    // Only show Admin (3) and SuperAdmin (5) if user has manage_roles permission
    const privilegedRoles = [3, 5]
    
    if (standardRoles.includes(roleId)) {
      return true
    }
    
    if (privilegedRoles.includes(roleId) && hasPermission('manage_roles')) {
      return true
    }
    
    return false
  })
  return (
    <Card className="border-0 shadow-none max-w-[600px]">
      <CardHeader>
        <CardTitle>Advanced Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sophistication_id">Technical Aptitude</Label>
            <SophisticationScore
              score={formData.sophistication_id}
              onChange={(value) => onSophisticationChange(value)}
              disabled={isSubmitting}
            />
            {errors.sophistication_id && <p className="text-sm text-red-500">{errors.sophistication_id}</p>}
          </div>

          <div className="space-y-2 flex items-end">
            <div className="flex-1">
              <Label htmlFor="is_user_vip" className="mr-2">VIP Status</Label>
              <div className="flex items-center space-x-2">
                <VIPSwitch
                  id="is_user_vip"
                  checked={formData.is_user_vip}
                  onCheckedChange={onVipChange}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-500">{formData.is_user_vip ? 'VIP' : 'Regular'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="client" className={cn(errors.client_id && "text-red-500")}>Client Company</Label>
            <ComboboxApi
              options={clients}
              value={formData.client_id ? formData.client_id.toString() : ''}
              onValueChange={onClientChange}
              onSearch={searchClients}
              isSearchLoading={isSearchingClients}
              searchDebounce={500}
              placeholder="Search clients..."
              emptyMessage="No clients found"
              disabled={isSubmitting}
              className="w-full"
              includeUnselect={false}
            />
            {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Combobox
              options={filteredRoles}
              value={formData.role_id ? formData.role_id.toString() : ''}
              onValueChange={onRoleChange}
              placeholder="Select a role"
              emptyMessage="No roles found"
              disabled={isSubmitting || isLoading}
              className="w-full"
            />
            {errors.role_id && <p className="text-sm text-red-500">{errors.role_id}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

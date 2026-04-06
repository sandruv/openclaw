'use client'

import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { ComboboxApi } from "@/components/ui/combobox-api"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { ClientInfoComboLoader } from "../../loaders/ClientInfoComboLoader"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { useUserStore } from "@/stores/useUserStore"
import { logger } from '@/lib/logger'
import { ValidationErrors } from "@/types/newTask"

interface ClientInfoComboboxesProps {
  clients: ComboboxOption[]
  users: ComboboxOption[]
  sites: ComboboxOption[]
  selectedClient: string
  selectedUser: string
  selectedSite: string
  onClientChange: (value: string) => void
  onUserChange: (value: string) => void
  onSiteChange: (value: string) => void
  errors: ValidationErrors
}

export default function ClientInfoComboboxes({
  clients,
  users,
  sites,
  selectedClient,
  selectedUser,
  selectedSite,
  onClientChange,
  onUserChange,
  onSiteChange,
  errors,
}: ClientInfoComboboxesProps) {

  const [isVIP, setIsVIP] = useState(false)
  const [score, setScore] = useState(3)
  const { isLoading, isSearchingClients, isSearchingUsers, searchClients, searchUsers } = useDropdownStore()
  const { getUser } = useUserStore()

  useEffect(() => {
    async function fetchUserData() {
      if (selectedUser) {
        try {
          const user = await getUser(Number(selectedUser))
          if (user) {
            setIsVIP(user.is_user_vip)
            setScore(Number(user.sophistication_id))
          }
        } catch (error) {
          console.error('Error fetching user:', error)
        }
      } else {
        setIsVIP(false)
        setScore(3)
      }
    }
    
    fetchUserData()
  }, [selectedUser, getUser])

  return (
    <div className="grid gap-4">
      {isLoading ? (
        <ClientInfoComboLoader />
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="client" className={cn(errors?.client && "text-red-500")}>
              Client
            </Label>
            <ComboboxApi
              options={clients}
              value={selectedClient}
              onValueChange={(value) => {
                onClientChange(value);
                onUserChange('');
                onSiteChange('');
              }}
              onSearch={searchClients}
              isSearchLoading={isSearchingClients}
              searchDebounce={500}
              placeholder="Search clients..."
              includeUnselect={false}
              data-testid="client-select"
            />
            {errors?.client && (
              <p className="text-sm text-red-500">{errors.client}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="site" className={cn(errors?.site && "text-red-500")}>
              Site
            </Label>
            <ComboboxApi
              options={sites}
              value={selectedSite}
              onValueChange={(value) => {
                onSiteChange(value);
              }}
              onSearch={async () => { /* No search implementation needed */ }}
              isSearchLoading={false}
              placeholder="Select a site"
              disabled={!selectedClient}
              className={cn(
                errors?.site && "border-red-500",
                !selectedClient && "opacity-50 cursor-not-allowed"
              )}
              data-testid="site-select"
            />
            {errors?.site && <p className="text-sm text-red-500">{errors.site}</p>}
          </div>

          <div className="grid gap-2">
            <div className="flex items-end justify-between">
              <div className="flex items-center space-x-2">
                <VIPSwitch
                  id="vip-mode"
                  checked={isVIP}
                  disabled={true}
                />
                <Label htmlFor="vip-mode" 
                    className={cn(
                        "text-xs font-medium text-red-700",
                        isVIP ? "text-red-500" : "text-gray-200"
                    )}>
                  VIP
                </Label>
              </div>
              <div>
                <SophisticationScore score={score} disabled={true} />
              </div>
            </div>
            <Label htmlFor="user" className={cn(errors?.user && "text-red-500")}>
              User
            </Label>
            <ComboboxApi
              options={users}
              value={selectedUser}
              onValueChange={(value) => {
                onUserChange(value);
              }}
              onSearch={(searchQuery) => {
                logger.debug('Searching users:', searchQuery);
                return searchUsers(searchQuery, selectedClient);
              }}
              isSearchLoading={isSearchingUsers}
              searchDebounce={500}
              placeholder="Search users..."
              disabled={!selectedClient}
              className={cn(
                errors?.user && "border-red-500",
                !selectedClient && "opacity-50 cursor-not-allowed"
              )}
              data-testid="user-select"
            />
            {errors?.user && <p className="text-sm text-red-500">{errors.user}</p>}
          </div>
        </>
      )}
    </div>
  )
}

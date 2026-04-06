'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pencil, Save, Loader2, X } from "lucide-react"
import { useState, useEffect } from "react"
import { getInitials } from "@/lib/utils"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useUserStore } from "@/stores/useUserStore"
import { useDropdownStore } from "@/stores/useDropdownStore"
import Link from "next/link"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { VipIndicator } from "@/components/custom/vip-indicator"
import { Button } from "@/components/ui/button"
import { ComboboxApi, type ComboboxOption } from "@/components/ui/combobox-api"
import { useToast } from "@/hooks/useToast"
import { Copy } from "lucide-react"

export function EndUserInfo() {
  const { task, updateTask, isLoading, isNavigating } = useTaskDetailsStore()
  const { 
    clients, 
    users, 
    isSearchingClients, 
    isSearchingUsers,
    fetchClients, 
    searchClients, 
    fetchUsers, 
    searchUsers 
  } = useDropdownStore()
  const [editMode, setEditMode] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState(task?.client?.id?.toString() || '')
  const [selectedUserId, setSelectedUserId] = useState(task?.user?.id?.toString() || '')
  // Loading states are managed by useDropdownStore
  const [filteredClients, setFilteredClients] = useState<ComboboxOption[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ComboboxOption[]>([])
  const { showToast } = useToast()
  
  // Initial data loading
  useEffect(() => {
    // Load clients when component mounts
    fetchClients()
  }, [fetchClients])

  // Use a single effect to handle user loading when client changes
  useEffect(() => {
    // Load users when selected client changes
    const loadUsers = async () => {
      if (!selectedClientId || !editMode) return
      await fetchUsers(selectedClientId)
    }
    
    loadUsers()
  }, [selectedClientId, editMode, fetchUsers])
  
  // Update filtered options from dropdown store data
  useEffect(() => {
    setFilteredClients(clients)
  }, [clients])
  
  useEffect(() => {
    setFilteredUsers(users)
  }, [users])

  const handleSearchClients = async (query: string) => {
    // Use dropdown store's searchClients method
    await searchClients(query)
  }

  const handleSearchUsers = async (query: string) => {
    if (!selectedClientId) return
    
    // Use dropdown store's searchUsers method
    await searchUsers(query, selectedClientId)
  }

  const handleSave = async () => {
    if (!task) return
    
    try {
      // Update both client and user IDs
      await updateTask({
        id: task.id,
        user_id: parseInt(selectedUserId),
        client_id: parseInt(selectedClientId)
      })
      
      showToast({
        title: "Success",
        description: "User details updated successfully",
        type: "success"
      })
      
      setEditMode(false)
    } catch (error) {
      console.error("Failed to update task:", error)
      showToast({
        title: "Error",
        description: "Failed to update user details",
        type: "error"
      })
    }
  }
  
  if (!task) {
    return null
  }

  // Handle nullable user and client data
  const clientName = task.client?.name || 'No Client'
  const jobTitle  = task.user?.job_title || '-'
  const isVip = task.user?.is_user_vip || false
  const sophisticationScore = task.user?.sophistication_id || 1
  const userEmail = task.user?.email || '-'
  const userFirstName = task.user?.first_name || ''
  const userLastName = task.user?.last_name || ''
  const userFullName = userFirstName || userLastName ? `${userFirstName} ${userLastName}`.trim() : '-'
  const userPhone = task.user?.phone_number || '-'
  const siteName = task.sites?.name || 'Main'
  const siteId = task.sites?.id

  const handleCancel = () => {
    if (task) {
      setSelectedClientId(task.client?.id?.toString() || '')
      setSelectedUserId(task.user?.id?.toString() || '')
    }
    setEditMode(false)
  }

  const handleCopyEmail = () => {
    if (userEmail && userEmail !== '-') {
      navigator.clipboard.writeText(userEmail)
      showToast({
        title: "Success",
        description: "Email copied to clipboard",
        type: "success"
      })
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-base font-medium">End-user Details</h2>
        {!editMode ? (
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={isNavigating}
            onClick={() => setEditMode(true)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 px-2 py-0 text-xs"
            >
              <X className="h-3 w-3" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              disabled={isLoading}
              className="h-8 px-2 py-0 text-xs bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6 px-4 h-[calc(100vh-465px)] border-b pb-2 overflow-auto styled-scrollbar">
        {!editMode && task.client && (
          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-md">
            <Avatar className="h-8 w-8">
                <AvatarFallback className="text-white bg-blue-500">
                  {getInitials(clientName)}
                </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-3">
              <span className="text-sm">{clientName}</span>
              {isVip && <VipIndicator />}
            </div>
          </div>
        )}
        

        <div className="space-y-4">
            {editMode ? (
              <>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Client</div>
                  <ComboboxApi
                    options={filteredClients}
                    value={selectedClientId}
                    onValueChange={(value) => {
                      setSelectedClientId(value);
                      setSelectedUserId(''); // Reset user when client changes
                    }}
                    onSearch={handleSearchClients}
                    isSearchLoading={isSearchingClients}
                    placeholder="Select client"
                    disabled={isLoading}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">User</div>
                  <ComboboxApi
                    options={filteredUsers}
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                    onSearch={handleSearchUsers}
                    isSearchLoading={isSearchingUsers}
                    placeholder="Select user"
                    disabled={isLoading || !selectedClientId}
                    className="h-9 text-xs"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1 ">
                  <div className="text-muted-foreground text-xs">Email</div>
                  <div className="flex">
                    <div className="text-sm mr-1">{userEmail}</div>
                    {/* button for copy email */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={isNavigating || userEmail === '-'}
                      onClick={handleCopyEmail}
                      className="h-8 w-8 p-0 mt-[-7px]"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Full Name</div>
                  <div className="text-sm">{userFullName}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Job Title</div>
                  <div className="text-sm">{jobTitle}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">User Sophistication</div>
                  <SophisticationScore score={sophisticationScore} disabled={true} />
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Phone Number</div>
                  <div className="text-sm">{userPhone}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Site</div>
                  {siteId ? (
                    <Link href={`/sites/${siteId}`} className="text-sm text-blue-600 hover:underline">
                      {siteName}
                    </Link>
                  ) : (
                    <span className="text-sm">{siteName}</span>
                  )}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  )
}
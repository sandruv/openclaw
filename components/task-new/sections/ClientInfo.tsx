'use client'

import React from 'react'
import { useNewTaskStore } from "@/stores/useNewTaskStore"
import { useDropdownStore } from "@/stores/useDropdownStore"
import EndUserDetails from "./user-details/EndUserDetails"
import AddNewUser from "./user-details/AddNewUser"
import { ValidationErrors } from "@/types/newTask"

interface ClientInfoProps {
  errors: ValidationErrors
}

export function ClientInfo({ errors }: ClientInfoProps) {
  const { newTask, setNewTask } = useNewTaskStore()
  const { clients, users, sites, searchUsers, fetchSites } = useDropdownStore()

  const handleComboboxChange = (field: 'client' | 'user' | 'site') => (value: string) => {
    const selectedOption = (field === 'client' ? clients : field === 'user' ? users : sites).find(option => option.value === value);
    
    if (selectedOption) {
      if (field === 'client') {
        searchUsers('', selectedOption.value);
        fetchSites(selectedOption.value);

        const selected_client = {
          ...selectedOption
        }
        
        setNewTask({
          end_user: {
            ...newTask.end_user,
            client: selected_client,
            user: null // Reset user when client changes
          }
        });
      } else if (field === 'user') {
        // Find the full user data from the mock data
        const userData = users.find(user => user.value === value)
        if (userData) {
          setNewTask({
            end_user: {
              ...newTask.end_user,
              user: {
                ...userData
              }
            }
          })
        }
      } else {
        setNewTask({
          end_user: {
            ...newTask.end_user,
            site: {
              ...selectedOption
            }
          }
        })
      }

      console.log('Selected Option for sites:', sites)
    } 
  }

  const handleManualUserChange = (field: 'first_name' | 'last_name' | 'email' | 'phone' | 'address', value: string) => {
    setNewTask({
      end_user: {
        ...newTask.end_user,
        manual_user: {
          ...newTask.end_user.manual_user,
          [field]: value
        }
      }
    })
  }

  const handleTechnicalAptitudeChange = (value: number) => {
    setNewTask({
      end_user: {
        ...newTask.end_user,
        technical_aptitude: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <EndUserDetails
        clients={clients}
        users={users}
        sites={sites}
        selectedClient={newTask.end_user.client?.value || ''}
        selectedUser={newTask.end_user.user?.value || ''}
        selectedSite={newTask.end_user.site?.value || ''}
        onClientChange={handleComboboxChange('client')}
        onUserChange={handleComboboxChange('user')}
        onSiteChange={handleComboboxChange('site')}
        errors={errors}
      />
      {!newTask.end_user.user && (
        <AddNewUser
          manualUser={newTask.end_user.manual_user}
          technicalAptitude={newTask.end_user.technical_aptitude}
          onManualUserChange={handleManualUserChange}
          onTechnicalAptitudeChange={handleTechnicalAptitudeChange}
          errors={errors}
        />
      )}
    </div>
  )
}

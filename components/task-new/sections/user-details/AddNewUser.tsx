'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { useNewTaskStore } from "@/stores/useNewTaskStore"
import { NewUserCardLoader } from "../../loaders/NewUserCardLoader"
import { GoogleAutocomplete } from "@/components/global/GoogleAutocomplete"
import { ValidationErrors } from "@/types/newTask"

interface NewUserCardProps {
  manualUser: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address: string
  }
  technicalAptitude: number
  onManualUserChange: (field: 'first_name' | 'last_name' | 'email' | 'phone' | 'address', value: string) => void
  onTechnicalAptitudeChange: (value: number) => void
  errors: ValidationErrors
}

export default function NewUserCard({
  manualUser,
  onManualUserChange,
  onTechnicalAptitudeChange,
  errors
}: NewUserCardProps) {

  const { isLoading } = useDropdownStore()
  const { validateManualUserAsync, errorState } = useNewTaskStore()
  const [isVIP, onVIPChange] = useState(false)

  // Handle email validation on blur
  const handleEmailBlur = async () => {
    if (!manualUser.email.trim()) return
    
    try {
      await validateManualUserAsync()
    } catch (error) {
      console.error('Email validation error:', error)
    }
  }

  // Check if there are any manual user validation errors
  const hasManualUserErrors = !!(
    errors.first_name || 
    errors.last_name || 
    errors.email || 
    errors.phone || 
    errors.address ||
    errors.technical_aptitude
  )

  return (
    <>
      {isLoading ? (
        <NewUserCardLoader />
      ) : (
        <Card className={cn("relative", hasManualUserErrors && "border-red-500")}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-4 space-y-4">
                <div className="space-y-2">
                  <Label>Add New User</Label>
                  <div className="flex items-end justify-between">
                    <div>
                      <SophisticationScore 
                        onChange={onTechnicalAptitudeChange} 
                        score={3}
                      />
                      {errors.technical_aptitude && (
                        <p className="text-red-500 text-xs mt-1">{errors.technical_aptitude}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <VIPSwitch
                        id="vip-mode"
                        checked={isVIP}
                        onCheckedChange={onVIPChange}
                      />
                      <Label htmlFor="vip-mode" 
                        className={cn(
                            "text-xs font-medium text-red-700",
                            isVIP ? "text-red-500" : "text-gray-200"
                        )}> VIP
                      </Label>
                    </div>
                    
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        id="userFirstName"
                        placeholder="First name"
                        value={manualUser.first_name}
                        onChange={(e) => onManualUserChange('first_name', e.target.value)}
                        className={cn(errors.first_name && "border-red-500")}
                      />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    <div>
                      <Input
                        id="userLastName"
                        placeholder="Last name"
                        value={manualUser.last_name}
                        onChange={(e) => onManualUserChange('last_name', e.target.value)}
                        className={cn(errors.last_name && "border-red-500")}
                      />
                      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Enter user's email"
                    value={manualUser.email}
                    onChange={(e) => onManualUserChange('email', e.target.value)}
                    onBlur={handleEmailBlur}
                    className={cn(
                      errors.email && "border-red-500",
                      errorState.isValidating && "border-blue-500"
                    )}
                    disabled={errorState.isValidating}
                  />
                  {errorState.isValidating && (
                    <p className="text-blue-500 text-xs mt-1">Validating email...</p>
                  )}
                  {errors.email && !errorState.isValidating && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    id="userPhone"
                    type="tel"
                    placeholder="Enter user's phone number"
                    value={manualUser.phone}
                    onChange={(e) => onManualUserChange('phone', e.target.value)}
                    className={cn(errors.phone && "border-red-500")}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <GoogleAutocomplete
                    onPlaceSelect={(place) => onManualUserChange('address', place.formatted_address || '')}
                    onManualInput={(value) => onManualUserChange('address', value)}
                    placeholder="Enter user's contact address"
                    defaultValue={manualUser.address}
                    className={cn(errors.address && "border-red-500")}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
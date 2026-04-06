'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAutocomplete } from "@/components/global/GoogleAutocomplete"
import { useUserStore } from "@/stores/useUserStore"
import { useCallback, useRef, useEffect } from "react"

interface UserFormData {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
}

interface BasicInformationProps {
  formData: UserFormData
  errors: any
  isSubmitting: boolean
  onChange: (field: keyof UserFormData, value: string) => void
}

export function BasicInformation({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange
}: BasicInformationProps) {
  const { validateEmailAsync, emailValidationErrors, isValidatingEmail, clearEmailValidationError } = useUserStore()
  const debounceTimeoutRef = useRef<NodeJS.Timeout>()

  const handleEmailBlur = useCallback(async (email: string) => {
    // Clear any pending debounced validation
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    if (email.trim()) {
      await validateEmailAsync(email, 'email')
    }
  }, [validateEmailAsync])

  const handleEmailChange = useCallback((value: string) => {
    onChange("email", value)
    // Clear validation error when user starts typing
    if (emailValidationErrors.email) {
      clearEmailValidationError('email')
    }

    // Debounced validation while typing (optional - mainly for onBlur)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }, [onChange, emailValidationErrors.email, clearEmailValidationError])

  // Cleanup timeout on unmount
  useEffect(() => {
    const currentTimeout = debounceTimeoutRef.current
    return () => {
      if (currentTimeout) {
        clearTimeout(currentTimeout)
      }
    }
  }, [])

  // Get the email error from either form validation or async validation
  const emailError = errors.email || emailValidationErrors.email
  return (
    <Card className="border-0 shadow-none max-w-[600px]">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onChange("first_name", e.target.value)}
              disabled={isSubmitting}
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onChange("last_name", e.target.value)}
              disabled={isSubmitting}
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              disabled={isSubmitting || isValidatingEmail}
              className={emailError ? "border-red-500" : ""}
            />
            {isValidatingEmail && <p className="text-sm text-blue-500">Validating email...</p>}
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone</Label>
            <Input
              id="phone_number"
              value={formData.phone_number || ''}
              onChange={(e) => onChange("phone_number", e.target.value)}
              disabled={isSubmitting}
              className={errors.phone_number ? "border-red-500" : ""}
            />
            {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <GoogleAutocomplete
            placeholder="Enter address"
            onPlaceSelect={(place) => onChange("address", place.formatted_address || '')}
            defaultValue={formData.address || ''}
            disabled={isSubmitting}
            className={errors.address ? "border-red-500" : ""}
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { useUserStore } from "@/stores/useUserStore"
import { z } from "zod"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { ComboboxOption } from "@/components/ui/combobox"
import { BasicInformation } from "./components/BasicInformation"
import { AdvancedInformation } from "./components/AdvancedInformation"
import { useToast } from "@/hooks/useToast"

// User form data type
interface UserFormData {
  first_name: string
  last_name: string
  email: string
  client_id: number
  role_id: number
  sophistication_id: number
  is_user_vip: boolean
  phone_number?: string
  address?: string
  password?: string
}

// Basic user schema
const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  client_id: z.number().positive("Client is required"),
  role_id: z.number().positive("Role is required"),
  sophistication_id: z.number().positive("Tech aptitude is required"),
  is_user_vip: z.boolean().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  password: z.string().optional().default('123456')
})

export function NewUserForm() {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { addUser, emailValidationErrors, validateEmailAsync } = useUserStore()
  const { clients, fetchClients } = useDropdownStore()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})
  
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    email: "",
    client_id: 0,
    role_id: 0,
    sophistication_id: 0,
    is_user_vip: false,
    password: "123456", // Default password
    phone_number: "",
    address: ""
  })

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleChange = (field: keyof UserFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      client_id: clientId ? parseInt(clientId, 10) : 0 
    }))
  }

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role_id: roleId ? parseInt(roleId, 10) : 0 
    }))
  }

  const handleSophisticationChange = (sophisticationId: number) => {
    setFormData(prev => ({ 
      ...prev, 
      sophistication_id: sophisticationId
    }))
  }

  const handleVipChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, is_user_vip: value }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrors({})

      // Check for email validation errors first
      if (emailValidationErrors.email) {
        setErrors({ email: emailValidationErrors.email })
        setIsSubmitting(false)
        return
      }

      // Validate email one more time before submission
      // const isEmailValid = await validateEmailAsync(formData.email, 'email')
      // if (!isEmailValid) {
      //   setErrors({ email: emailValidationErrors.email })
      //   setIsSubmitting(false)
      //   return
      // }

      // Validate form data
      const validatedData = userSchema.parse(formData)
      
      // Create user with proper typing for UserInput
      await addUser({
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        email: formData.email || '',
        client_id: formData.client_id || 0,
        role_id: formData.role_id || 0,
        is_user_vip: formData.is_user_vip || false,
        sophistication_id: formData.sophistication_id || 3,
        password: '123456',
        phone_number: formData.phone_number || '',
        address: formData.address || ''
      })
      
      // Show success toast notification
      toast.showToast({
        title: 'Success',
        description: `User ${formData.first_name} ${formData.last_name} has been added successfully`,
        type: 'success',
        duration: 5000
      })
      
      // Redirect back to users list
      setIsLoading(true)
      router.push('/clients/users')
      router.refresh()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message
          }
        })
        setErrors(fieldErrors)
      }
      setIsSubmitting(false)
    }
  }

  // Convert options to ComboboxOption format
  const clientOptions: ComboboxOption[] = clients.map(client => ({
    value: client.value,
    label: client.label
  }))

  return (
    <div className="relative min-h-[calc(100vh-170px)]">
      <div className="pb-[80px]">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Add New User</h1>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 gap-4">
          <BasicInformation
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
          />

          <AdvancedInformation
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onRoleChange={handleRoleChange}
            onSophisticationChange={handleSophisticationChange}
            onVipChange={handleVipChange}
            clients={clientOptions}
            onClientChange={handleClientChange}
          />
        </div>
      </div>

      {/* Footer Component */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="container py-4 flex justify-end space-x-4">
          <Button
            className="h-10 w-50"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="h-10 w-[200px] bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </div>
      </div>
    </div>
  )
}

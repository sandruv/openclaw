'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { Client } from "@/types/clients"
import { z } from "zod"
import { BasicInformation } from "../subcomponents/FormBasicInformation"
import { AdditionalInformation } from "../subcomponents/FormAdditionalInformation"
import { FormStatusDropdown } from "../subcomponents/FormStatusDropdown"
import { clientSchema } from "@/types/clients"
import { Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/components/ui/toast-provider"
import { ClientService } from "@/services/clientService"

interface UpdateClientFormProps {
  client: Client
}

export function UpdateClientForm({ client }: UpdateClientFormProps) {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [formData, setFormData] = useState({
    name: client.name || "",
    shortName: client.shortName || "",
    email: client.email || "",
    phone: client.phone_number || "",
    address: client.address || "",
    owner: client.owner || "",
    poc: client.poc || "",
    type: client.type || "Client",
    serviceType: client.serviceType || "MSP",
    description: client.description || "",
    alertMessage: client.alertMessage || "",
    parentOrg: client.parentOrg || "",
    logo: client.logo || [],
    active: client.active,
    is_client_vip: client.is_client_vip || false,
    status_id: client.status_id || 2 // Default to 2 (Pending) if no status_id is provided
  })

  const handleChange = (field: string, value: any) => {
    console.log(field, value)
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setFormData(prev => ({
      ...prev,
      address: place.formatted_address || '',
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      logo: [...prev.logo, ...files]
    }))
  }

  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      logo: prev.logo.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Extract only the required fields
      const essentialData = {
        id: client.id,
        name: formData.name,
        address: formData.address,
        is_client_vip: formData.is_client_vip,
        status_id: formData.status_id
      }
      
      // Skip validation for now and directly submit the essential data
      const response = await ClientService.updateClient(essentialData as any)
      
      if(response.status !== 200) {
        console.log(response)
        throw new Error(response.message)
      }
      // If we get here, the API call was successful
      
      showToast({
        title: "Success",
        description: "Client updated successfully",
        type: "success",
      })
      setIsLoading(true)
      router.push('/clients')
    } catch (error: any) {
      // First check if it's a client-side validation error (ZodError)
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {}
        error.errors.forEach((err) => {
          const field = err.path[0]
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        
        showToast({
          title: "Validation Failed",
          description: "Please check the form for errors.",
          type: "error",
        })
        return
      }
      
      // Check for enhanced error with responseData property
      const responseData = (error as any).responseData;
      
      if (responseData) {
        console.log("Full API error response:", responseData);
        
        // Check for validation errors in data property (new structure)
        if (typeof responseData.data === 'object' && responseData.data !== null) {
          // Set field-specific errors
          setErrors(responseData.data);
          
          // Show the first error in a toast
          const firstErrorMessage = Object.values(responseData.data)[0];
          showToast({
            title: "Client Update Failed",
            description: firstErrorMessage as string,
            type: "error",
          });
          return;
        } else if (responseData.message) {
          // Fallback to message if no structured errors
          const errorMessage = responseData.message;
          
          // Try to determine if it's a name validation error
          if (errorMessage.toLowerCase().includes('name')) {
            setErrors({
              name: errorMessage
            });
          }
          
          showToast({
            title: "Client Update Failed",
            description: errorMessage,
            type: "error",
          });
          return;
        }
      }
      
      // Generic error toast if not handled above
      showToast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] dark:bg-gray-950">
      {/* Form Content */}
      <div className="flex-1 container py-6 pb-24 pl-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <BasicInformation
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onPlaceSelect={handlePlaceSelect}
                onChange={handleChange}
              />
              
              {/* Status Dropdown */}
              <div className="mt-6">
                <FormStatusDropdown
                  value={formData.status_id}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  errors={errors}
                />
              </div>
            </div>
            {/* <div className="space-y-8">
              <AdditionalInformation
                formData={formData}
                errors={errors}
                isSubmitting={isSubmitting}
                onChange={handleChange}                
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
              />
            </div> */}
          </div>
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="container py-4">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white h-10 w-40"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Client
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

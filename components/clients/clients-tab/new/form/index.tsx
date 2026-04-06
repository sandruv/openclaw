'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { BasicInformation } from "../../subcomponents/FormBasicInformation"
import { AdditionalInformation } from "../../subcomponents/FormAdditionalInformation"
import { ClientFormData, ClientFormState, clientSchema } from "@/types/clients"
import { z } from "zod"
import { useToast } from "@/components/ui/toast-provider"
import { ClientService } from "@/services/clientService"

export function NewClientForm() {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<ClientFormData>>({})
  const [formData, setFormData] = useState<ClientFormState>({
    status_id: 1,
    name: "",
    address: "",
    is_client_vip: false,
    shortName: "",
    email: "",
    phone: "",
    owner: "",
    poc: "",
    type: "Client",
    serviceType: "MSP",
    description: "",
    alertMessage: "",
    parentOrg: "",
    logo: [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // const validatedData = clientSchema.parse(formData)
      await ClientService.createClient(formData)
      
      // If we get here, it means the API call was successful
      showToast({
        title: "Client Added",
        description: "The client has been successfully added.",
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
            title: "Validation Failed",
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
            title: "Validation Failed",
            description: errorMessage,
            type: "error",
          });
          return;
        }
      }
      
      // Fallback to basic error message if no enhanced structure
      const errorMessage = error.message || String(error);
      showToast({
        title: "Client Add Failed",
        description: errorMessage,
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof ClientFormState, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setFormData(prev => ({
      ...prev,
      address: place.formatted_address || '',
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, logo: [file] }))
      if (errors.logo) {
        setErrors((prev) => ({ ...prev, logo: undefined }))
      }
    }
  }

  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, logo: [] }))
  }

  return (
    <div className="rounded-lg border-none bg-card">
      <form onSubmit={handleSubmit} className="relative min-h-full">
        <div className="p-6 pt-0 pb-20">
          <div className="grid grid-cols-3 gap-x-8 gap-y-6">
            {/* Left Column */}
            <BasicInformation
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onPlaceSelect={handlePlaceSelect}
            />

            {/* Right Column */}
            {/* <AdditionalInformation
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onFileRemove={handleFileRemove}
            /> */}
          </div>
        </div>

        <div className="fixed bottom-0 right-0 w-full bg-background border-t p-4 flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="w-[200px] bg-blue-500 hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Client"}
          </Button>
        </div>
      </form>
    </div>
  )
}

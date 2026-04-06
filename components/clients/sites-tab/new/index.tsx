'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { useSiteStore } from "@/stores/useSiteStore"
import { SiteFormData, siteSchema } from "@/types/clients"
import { z } from "zod"
import { BasicInformation } from "./form/BasicInformation"
import { Footer } from "./form/Footer"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDropdownStore } from "@/stores/useDropdownStore"
import { ComboboxOption } from "@/components/ui/combobox"

export function NewSiteForm() {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { addSite } = useSiteStore()
  const { clients, fetchClients } = useDropdownStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const [formData, setFormData] = useState<SiteFormData>({
    name: "",
    address: "",
    phone_number: "",
    client_id: 0,
    status: "active",
  })

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleChange = (field: keyof SiteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClientChange = (clientId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      client_id: clientId ? parseInt(clientId, 10) : 0 
    }))
  }

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      handleChange('address', place.formatted_address)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrors({})

      // Validate form data
      // const validatedData = siteSchema.parse(formData)
      
      // Create site
      await addSite(formData)
      
      // Redirect back to sites list
      setIsLoading(true)
      router.push('/clients/sites')
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
          <h1 className="text-xl font-semibold">Add New Site</h1>
        </div>

        <BasicInformation
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onPlaceSelect={handlePlaceSelect}
          onClientChange={handleClientChange}
        />
      </div>

      <Footer
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
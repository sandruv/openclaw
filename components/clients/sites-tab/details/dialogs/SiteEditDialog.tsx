"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Site } from "@/types/clients"
import { useSiteStore } from "@/stores/useSiteStore"
import { useToast } from '@/components/ui/toast-provider'
import { z } from "zod"
import { Loader2, Building, MapPin, Phone } from "lucide-react"
import { GoogleAutocomplete } from "@/components/global/GoogleAutocomplete"

const siteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phone_number: z.string().min(1, "Phone is required"),
  status: z.string().default("active"),
})

interface SiteEditDialogProps {
  site: Site
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SiteEditDialog({ site, isOpen, onOpenChange, onSuccess }: SiteEditDialogProps) {
  const { updateSite } = useSiteStore()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: site?.name || '',
    address: site?.address || '',
    phone_number: site?.phone_number || '',
  })

  const handlePlaceSelect = (place: any) => {
    setFormData((prev) => ({ 
      ...prev, 
      address: place.formattedAddress || prev.address 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (!site?.id) {
      throw new Error('No site ID provided')
    }

    try {
      // const validatedData = siteSchema.parse(formData)
      await updateSite({ id: site.id, ...formData })
      
      // Close dialog first
      onOpenChange(false)
      
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Site details have been updated successfully.',
      })

      // Call onSuccess callback if provided
      onSuccess?.()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update site details.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Site Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <Building className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="pl-8"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 z-10" />
                <GoogleAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Enter site address"
                  defaultValue={formData.address}
                  className="pl-8"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                  }
                  className="pl-8"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

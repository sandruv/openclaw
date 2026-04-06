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
import { Client } from "@/types/clients"
import { useToast } from '@/components/ui/toast-provider'
import { Loader2, Building2, Mail, Phone, MapPin } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { ClientService } from "@/services/clientService"

interface ClientEditDialogProps {
  client: Client | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ClientEditDialog({ client, isOpen, onOpenChange, onSuccess }: ClientEditDialogProps) {
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone_number: client?.phone_number || "",
    address: client?.address || "",
    active: client?.active
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    if (!client?.id) {
      throw new Error('No client ID provided')
    }

    try {
      // Need to include id as a query parameter, not in the data payload
      const updateData = { ...formData }
      // Add necessary type assertion to match the expected UpdateClientData type
      const response = await ClientService.updateClient({ ...updateData, id: client.id } as any)
      
      // If we get here, the API call was successful
      // Close dialog first
      onOpenChange(false)
      
      showToast({
        type: 'success',
        title: 'Success',
        description: 'Client details have been updated successfully.',
      })

      // Call onSuccess callback if provided
      onSuccess?.()
    } catch (error: any) {
      // Check for enhanced error with responseData property
      const responseData = (error as any).responseData;
      
      if (responseData) {
        console.log("Full API error response:", responseData);
        
        // Check for validation errors in data property (new structure)
        if (typeof responseData.data === 'object' && responseData.data !== null) {
          // Get the first error for the toast
          const firstErrorMessage = Object.values(responseData.data)[0];
          setError(firstErrorMessage as string);
          
          showToast({
            type: 'error',
            title: "Client Update Failed",
            description: firstErrorMessage as string,
          });
          return;
        } else if (responseData.message) {
          // Fallback to message if no structured errors
          const errorMessage = responseData.message;
          setError(errorMessage);
          
          showToast({
            type: 'error',
            title: "Client Update Failed",
            description: errorMessage,
          });
          return;
        }
      }
      
      // Generic error handling
      const errorMsg = 'Failed to update client. Please try again.'
      setError(errorMsg)
      showToast({
        type: 'error',
        title: 'Error',
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-gray-500 text-xs">Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="name"
                  value={formData.name}
                  className="pl-9"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-10 gap-4">
              <div className="col-span-6 grid gap-2">
                <Label htmlFor="email" className="text-gray-500 text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className="pl-9"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="col-span-4 grid gap-2">
                <Label htmlFor="phone_number" className="text-gray-500 text-xs">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    className="pl-9"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-gray-500 text-xs">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="address"
                  value={formData.address}
                  className="pl-9"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-500 text-xs">
                Status
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="status"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                  className="data-[state=checked]:bg-teal-600"
                />

                <span className="text-sm text-gray-500">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
                
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

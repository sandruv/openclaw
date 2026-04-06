'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAutocomplete } from "@/components/global/GoogleAutocomplete"
import { SiteFormData } from "@/types/clients"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ComboboxApi, ComboboxOption } from "@/components/ui/combobox-api"
import { useDropdownStore } from "@/stores/useDropdownStore"

interface BasicInformationProps {
  formData: SiteFormData
  errors: any
  isSubmitting: boolean
  onChange: (field: keyof SiteFormData, value: string) => void
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
  onClientChange: (clientId: string) => void
  isClientSearchLoading?: boolean
}


export function BasicInformation({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange,
  onPlaceSelect,
  onClientChange,
  isClientSearchLoading = false
}: BasicInformationProps) {
  const { clients, fetchClients, isLoading, searchClients, isSearchingClients } = useDropdownStore()

  return (
    <Card className="border-0 shadow-none max-w-[500px]">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <ComboboxApi
            options={clients}
            value={formData.client_id ? formData.client_id.toString() : ''}
            onValueChange={onClientChange}
            onSearch={searchClients}
            isSearchLoading={isSearchingClients}
            searchDebounce={500}
            placeholder="Search clients..."
            emptyMessage="No clients found"
            disabled={isSubmitting}
            className="w-full"
            includeUnselect={false}
          />
          {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Site Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          
        <GoogleAutocomplete
            onPlaceSelect={(place) => {
                onChange("address", place.formatted_address || "")
            }}
            placeholder="Enter site address"
            defaultValue={formData.address}
            className="w-full"
          />
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => onChange("phone_number", e.target.value)}
            disabled={isSubmitting}
          />
          {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
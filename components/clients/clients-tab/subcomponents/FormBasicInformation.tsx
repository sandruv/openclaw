'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ClientFormData } from "@/types/clients"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { GoogleAutocomplete } from "@/components/global/GoogleAutocomplete"

interface BasicInformationProps {
  formData: ClientFormData
  errors: Partial<ClientFormData>
  isSubmitting: boolean
  onChange: (field: keyof ClientFormData, value: string | boolean) => void
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
}

export function BasicInformation({ formData, errors, isSubmitting, onChange, onPlaceSelect }: BasicInformationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="is_client_vip" className="mr-4">VIP Client</Label>
          <VIPSwitch
            id="is_client_vip"
            checked={formData.is_client_vip}
            onCheckedChange={(checked) => onChange("is_client_vip", checked)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
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
          onPlaceSelect={onPlaceSelect}
          placeholder="Enter client address"
          defaultValue={formData.address}
          className="w-full"
          disabled={isSubmitting}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* <div className="space-y-2">
        <Label htmlFor="shortName" className="text-muted-foreground">Short Name</Label>
        <Input
          id="shortName"
          value={formData.shortName}
          onChange={(e) => onChange("shortName", e.target.value)}
          disabled={true}
          className="text-muted-foreground"
        />
        {errors.shortName && <p className="text-sm text-red-500">{errors.shortName}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="poc" className="text-muted-foreground">POC</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Point of Contact</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="poc"
          value={formData.poc}
          onChange={(e) => onChange("poc", e.target.value)}
          disabled={true}
          className="text-muted-foreground"
        />
        {errors.poc && <p className="text-sm text-red-500">{errors.poc}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          disabled={true}
          className="text-muted-foreground"
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-muted-foreground">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          disabled={true}
          className="text-muted-foreground"
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner" className="text-muted-foreground">Owner</Label>
        <Input
          id="owner"
          value={formData.owner}
          onChange={(e) => onChange("owner", e.target.value)}
          disabled={true}
          className="text-muted-foreground"
        />
        {errors.owner && <p className="text-sm text-red-500">{errors.owner}</p>}
      </div> */}
    </div>
  )
}

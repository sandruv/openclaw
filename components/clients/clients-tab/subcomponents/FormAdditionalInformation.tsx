'use client'

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileDropbox } from "@/components/custom/FileDropbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClientTypeSelector, type ClientType } from "./FieldClientTypeSelector"
import { ServiceTypeSelector, type ServiceType } from "./FieldServiceTypeSelector"
import { ClientFormData } from "@/types/clients"

interface AdditionalInformationProps {
  formData: ClientFormData
  errors: any
  isSubmitting: boolean
  onChange: (field: keyof ClientFormData, value: string | string[]) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFileRemove: (index: number) => void
}

export function AdditionalInformation({ 
  formData, 
  errors, 
  isSubmitting, 
  onChange,
  onFileChange,
  onFileRemove
}: AdditionalInformationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-muted-foreground">Type</Label>
        <ClientTypeSelector
          selectedType={formData.type as ClientType}
          onTypeChange={(type) => onChange("type", type)}
          disabled={true}
        />
        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
      </div>

      {formData.type === 'Client' && (
        <div className="space-y-2">
          <Label className="text-muted-foreground">Service Type</Label>
          <ServiceTypeSelector
            selectedType={formData.serviceType as ServiceType}
            onTypeChange={(type) => onChange("serviceType", type)}
            disabled={true}
          />
          {errors.serviceType && <p className="text-sm text-red-500">{errors.serviceType}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="parentOrg" className="text-muted-foreground">Parent Organization</Label>
        <Select
          value={formData.parentOrg}
          onValueChange={(value) => onChange("parentOrg", value)}
          disabled={true}
        >
          <SelectTrigger className="text-muted-foreground">
            <SelectValue placeholder="Select parent organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="org1">Organization 1</SelectItem>
            <SelectItem value="org2">Organization 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-muted-foreground">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          disabled={true}
          rows={3}
          className="text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="alertMessage" className="text-muted-foreground">Alert Message</Label>
        <Textarea
          id="alertMessage"
          value={formData.alertMessage}
          onChange={(e) => onChange("alertMessage", e.target.value)}
          disabled={true}
          rows={2}
          className="text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-muted-foreground">Logo</Label>
        <FileDropbox
          selectedFiles={formData.logo || []}
          onFileChange={onFileChange}
          onFileRemove={onFileRemove}
          disabled={true}
        />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSiteStore } from "@/stores/useSiteStore"
import { useClientStore } from "@/stores/useClientStore"
import { z } from "zod"
import { ClientCombobox } from "@/components/clients/clients-tab/subcomponents/ClientCombobox"
import { logger } from '@/lib/logger'

const siteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  client_id: z.string().min(1, "Client is required"),
  // contact_person: z.string().min(1, "Contact person is required"),
  phone_number: z.string().min(1, "Phone is required"),
  status: z.string().default("active"),
})

type SiteFormData = z.infer<typeof siteSchema>

export function AddSiteDialog() {
  const { addSite } = useSiteStore()
  const { clients } = useClientStore()
  const { compactMode } = useSettingsStore()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<SiteFormData>>({})
  const [formData, setFormData] = useState<SiteFormData>({
    name: "",
    address: "",
    client_id: "",
    // contact_person: "",
    phone_number: "",
    status: "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = siteSchema.safeParse(formData)
    logger.debug('AddSiteDialog result:', result)

    if (!result.success) {
      setIsSubmitting(false)
      // Format Zod errors into our errors object
      const formattedErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0]] = issue.message
      })
      setErrors(formattedErrors)
      return
    }

    try {
      const siteToAdd = {
        name: result.data.name,
        address: result.data.address,
        phone_number: result.data.phone_number,
        client_id: Number(result.data.client_id),
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await addSite(siteToAdd)
      
      setOpen(false)

      setFormData({
        name: "",
        address: "",
        client_id: "",
        // contact_person: "",
        phone_number: "",
        status: "active",
      })
      
      setErrors({})
      // Reset errors
      setErrors({
        name: undefined,
        address: undefined,
        client_id: undefined,
        // contact_person: undefined,
        phone_number: undefined,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<keyof SiteFormData, string | undefined> = {
          name: undefined,
          address: undefined,
          client_id: undefined,
          // contact_person: undefined,
          phone_number: undefined,
          status: undefined,
        }
        
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof SiteFormData
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof SiteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const button = (
    <Button variant="default" className={`bg-blue-600 hover:bg-blue-700 flex items-center ${compactMode ? 'px-2' : 'gap-2'}`}>
      <Plus className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
      {!compactMode && <span>Add Site</span>}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compactMode ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {button}
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Site</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          button
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                disabled={isSubmitting}
              />
              {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <ClientCombobox
              value={formData.client_id}
              onChange={(value) => handleChange("client_id", value)}
              disabled={isSubmitting}
            />
            {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Site'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

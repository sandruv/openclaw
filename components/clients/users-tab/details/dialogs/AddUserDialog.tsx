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
import { useUserStore } from "@/stores/useUserStore"
import { useClientStore } from "@/stores/useClientStore"
import { z } from "zod"
import { ClientCombobox } from "@/components/clients/clients-tab/subcomponents/ClientCombobox"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const userSchema = z.object({
  first_name: z.string().min(1, "First Name is required"),
  last_name: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone is required"),
  role_id: z.string().min(1, "Role is required"),
  client_id: z.string().min(1, "Client is required"),
  address: z.string().min(1, "Address is required"),
  sophistication_id: z.number().min(1).max(5),
  is_user_vip: z.boolean().default(false),
})

type UserFormData = z.infer<typeof userSchema>

export function AddUserDialog() {
  const { addUser } = useUserStore()
  const { clients } = useClientStore()
  const { compactMode } = useSettingsStore()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<UserFormData>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role_id: "1",
    client_id: "1",
    address: "",
    sophistication_id: 3,
    is_user_vip: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const validationResult = userSchema.safeParse(formData)
    
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {}
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string
        newErrors[path] = issue.message
      })
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      await addUser({
        ...formData,
        role_id: Number(formData.role_id),
        client_id: Number(formData.client_id),
        password: '123456'
      })

      setOpen(false)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        role_id: "1",
        client_id: "1",
        address: "",
        sophistication_id: 1,
        is_user_vip: false,
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to add user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const button = (
    <Button variant="default" className={`bg-blue-600 hover:bg-blue-700 flex items-center ${compactMode ? 'px-2' : 'gap-2'}`}>
      <Plus className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
      {!compactMode && <span>Add User</span>}
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
                <p>Add User</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          button
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" {...(isSubmitting && { disabled: true })}>
          <div className="grid grid-cols-2 gap-4">
            {/* Sophistication Score and VIP Row */}
            <div className="space-y-2">
              <Label htmlFor="sophistication_id">Technical Aptitude</Label>
              <SophisticationScore
                score={formData.sophistication_id}
                onChange={(value) => handleChange("sophistication_id", value)}
                disabled={isSubmitting}
              />
              {errors.sophistication_id && <p className="text-sm text-red-500">{errors.sophistication_id}</p>}
            </div>
            <div className="space-y-2 flex items-end">
              <div className="flex-1">
                <Label htmlFor="is_user_vip" className="mr-2">VIP Status</Label>
                <div className="flex items-center space-x-2">
                  <VIPSwitch
                    id="is_user_vip"
                    checked={formData.is_user_vip}
                    onCheckedChange={(checked) => handleChange("is_user_vip", checked)}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-gray-500">{formData.is_user_vip ? 'VIP' : 'Regular'}</span>
                </div>
              </div>
            </div>

            {/* First Name and Last Name Row */}
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className={errors.first_name ? "border-red-500" : ""}
              />
              {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className={errors.last_name ? "border-red-500" : ""}
              />
              {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
            </div>

            {/* Email and Phone Row */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => handleChange("phone_number", e.target.value)}
                className={errors.phone_number ? "border-red-500" : ""}
              />
              {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
            </div>

            {/* Role and Address Row */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={String(formData.role_id)}
                onValueChange={(value) => handleChange("role_id", value)}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">User</SelectItem>
                  <SelectItem value="1">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <ClientCombobox
                value={String(formData.client_id)}
                onChange={(value) => handleChange("client_id", value)}
              />
              {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>

          <div className="pt-4">
            <div className="flex justify-end space-x-2">
              <Button 
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add User'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

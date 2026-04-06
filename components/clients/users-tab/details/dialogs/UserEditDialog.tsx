'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { Loader2, User as UserIcon, Mail, Phone, Crown, Signal } from "lucide-react"
import { User } from "@/types/clients"
import { useUserStore } from "@/stores/useUserStore"
import { useState, useEffect } from "react"
import { useToast } from '@/components/ui/toast-provider'

interface UserEditDialogProps {
  user: User
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function UserEditDialog({ user, isOpen, onOpenChange }: UserEditDialogProps) {
  const {updateUser, getUser, error: storeError, isFetchingUser} = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone_number: user.phone_number || '',
    role_id: user.role_id || 3,
    sophistication_id: user.sophistication_id || 1,
    is_user_vip: user.is_user_vip || false,
  })

  // Watch for store errors
  useEffect(() => {
    if (storeError && !isFetchingUser) {
      // Check if the store error contains backend validation info
      showToast({
        type: 'error',
        title: 'Error',
        description: storeError,
      });
    }
  }, [storeError, isFetchingUser, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({}) // Clear previous errors
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedUser = await updateUser(user.id, formData)
      
      // Close dialog first
      onOpenChange(false)
      
      // Show success toast after a delay
      if(updatedUser.status === 200) {
        showToast({
          type: 'success',
          title: 'Success',
          description: 'User details have been updated successfully.',
        })
      } else {
        throw new Error(updatedUser.message)
      }
    } catch (error) {
      // Handle backend validation errors
      if (error instanceof Error && (error as any).responseData) {
        const responseData = (error as any).responseData;
        
        // Check if it's a 409 conflict (email duplicate)
        if (responseData.status === 409) {
          setErrors({ email: responseData.message });
          showToast({
            type: 'error',
            title: 'Validation Error',
            description: responseData.message,
          });
          return; // Don't close dialog, let user fix the error
        }
        
        // Handle other validation errors (400)
        if (responseData.status === 400) {
          setErrors({ general: responseData.message });
          showToast({
            type: 'error',
            title: 'Validation Error',
            description: responseData.message,
          });
          return;
        }
      }
      
      // Handle generic errors
      showToast({
        type: 'error',
        title: 'Update Error',
        description: error instanceof Error ? error.message : 'Failed to update user details.',
      })
    } finally {
      setIsLoading(false)
      await new Promise(resolve => setTimeout(resolve, 500))
      getUser(user.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogDescription>Make changes to the user profile here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-gray-500 text-sm flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  VIP Status
                </Label>
                <VIPSwitch
                  checked={formData.is_user_vip}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_user_vip: checked })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-500 text-sm flex items-center gap-2">
                  <Signal className="h-4 w-4" />
                  Sophistication Score
                </Label>
                <SophisticationScore
                  score={formData.sophistication_id}
                  onChange={(value) => setFormData({ ...formData, sophistication_id: value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name" className="text-gray-500 text-sm flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  First Name
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name" className="text-gray-500 text-sm flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-gray-500 text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  // Clear email error when user starts typing
                  if (errors.email) {
                    setErrors({ ...errors, email: '' })
                  }
                }}
                disabled={isLoading}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone_number" className="text-gray-500 text-sm flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-gray-500 text-sm flex items-center gap-2">
                Role
              </Label>
              <select
                id="role"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                disabled={isLoading}
              >
                <option value={1}>Admin</option>
                <option value={2}>User</option>
                <option value={3}>Guest</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
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

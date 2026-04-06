'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SophisticationScore } from "@/components/custom/SophisticationScore"
import { VIPSwitch } from "@/components/custom/vip-switch"
import { User } from "@/types/clients"
import { useSettingsStore } from '@/stores/useSettingsStore'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDate } from "@/lib/dateTimeFormat"
import { Pencil, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { useToast } from "@/components/ui/toast-provider"
import { RoleNames } from "@/lib/roleProvider"

interface UserDetailsTabProps {
  user: User
}

export function UserDetailsTab({ user }: UserDetailsTabProps) {
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { compactMode } = useSettingsStore()
  const { showToast } = useToast()

  const handleEditClick = () => {
    setIsLoading(true)
    router.push(`/clients/users/${user.id}/edit`)
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(user.email)
      showToast({ title: 'Success', description: 'Email copied to clipboard', type: 'success' })
    } catch (error) {
      showToast({ title: 'Error', description: 'Failed to copy email', type: 'error' })
    }
  }

  return (
    <Card className="rounded-none shadow-none border-x-0">
      <CardHeader className="flex flex-row items-center border-b border-border py-4">
        <CardTitle className="mr-5 mt-1">User Details</CardTitle>
        {compactMode ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleEditClick} 
                  variant="default"
                  className="bg-blue-500 hover:bg-blue-600 px-4"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            onClick={handleEditClick} 
            variant="default"
            className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="grid grid-cols-2 divide-x divide-border pb-0">
        <div className="pr-6 space-y-6 py-5">
          <div className="grid gap-2">
            <Label className="text-gray-300">Name</Label>
            <div>{user.first_name} {user.last_name}</div>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-300">Email</Label>
            <div className="flex items-center gap-2">
              <span>{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyEmail}
                className="h-6 w-6 p-0 bg-gray-100 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-300">Role</Label>
            <div>
              <Badge variant="secondary">{ RoleNames[user.role_id as any]}</Badge>
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-300">Company</Label>
            <div>{user.client.name}</div>
          </div>
        </div>
        <div className="pl-6 space-y-6 py-5">
          <div className="grid gap-2">
            <Label className="text-gray-300">VIP Status</Label>
            <div>
              <VIPSwitch checked={user.is_user_vip} disabled/>
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-300">Sophistication Score</Label>
            <div>
              <SophisticationScore score={user.sophistication_id} disabled />
            </div>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-300">Registered</Label>
            <div>{formatDate(user.created_at)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

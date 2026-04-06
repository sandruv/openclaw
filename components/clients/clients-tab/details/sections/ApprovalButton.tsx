"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Client } from "@/types/clients"
import { useToast } from "@/components/ui/toast-provider"
import { getClientApprovalUrl } from "@/services/clientService"
import { useSettingsStore } from '@/stores/useSettingsStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ApprovalButtonProps {
  client?: Client
}

export function ApprovalButton({ client }: ApprovalButtonProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const { compactMode } = useSettingsStore()

  const handleApproval = async () => {
    if (!client?.tenant_id) {
      showToast({
        title: "Error",
        description: "Client doesn't have a tenant ID",
        type: "error",
        duration: 5000
      })
      return
    }

    try {
      // Get the approval URL from the service
      const approvalUrl = await getClientApprovalUrl(client.tenant_id)
      
      if (!approvalUrl) {
        showToast({
          title: "Error",
          description: "Failed to generate approval URL. Please check server configuration.",
          type: "error",
          duration: 5000
        })
        return
      }
      
      // Open the URL in a new tab
      window.open(approvalUrl, "_blank")
    } catch (error) {
      console.error('Error generating approval URL:', error)
      showToast({
        title: "Error",
        description: "An error occurred while generating the approval URL",
        type: "error",
        duration: 5000
      })
    }
  }

  const button = (
    <Button
      variant="outline"
      className={`border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 flex items-center ${compactMode ? 'px-4' : 'gap-2'}`}
      onClick={handleApproval}
      disabled={!client?.tenant_id}
    >
      <Check className={`h-4 w-4 ${!compactMode ? 'mr-2' : ''}`} />
      {!compactMode && <span>Approve Access</span>}
    </Button>
  )

  if (compactMode) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>Approve Access</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}

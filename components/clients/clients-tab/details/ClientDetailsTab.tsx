"use client"

import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/dateTimeFormat"
import { ClientEditDialog } from "./dialogs/ClientEditDialog"
import { useClientStore } from "@/stores/useClientStore"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"
import { useSettingsStore } from '@/stores/useSettingsStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"
import { getClientStatusColor } from "@/lib/clientUsersUtils"
import { ApprovalButton } from "./sections/ApprovalButton"

export function ClientDetailsTab() {
  const [isEditing, setIsEditing] = useState(false)
  const client = useClientStore((state) => state.client)
  const router = useRouter()
  const { setIsLoading } = useLoader()
  const { compactMode } = useSettingsStore()

  return (
    <PanelGroup direction="horizontal" className="h-full">
      {/* Client Information */}
      <Panel defaultSize={70} minSize={50}>
        <Card className="rounded-none border-0 h-[calc(100vh-135px)] dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between border-b dark:border-gray-700 py-4 pt-3 px-6">
            <CardTitle className="dark:text-gray-100">Client Information</CardTitle>
            <div className="flex space-x-2">
              <ApprovalButton client={client || undefined} />
              {compactMode ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="default" 
                        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 px-4"
                        onClick={() => { setIsLoading(true); router.push(`/clients/${client?.id}/details/update`) }}
                      >
                        <Pencil className="h-4 w-4 dark:text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Update</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button 
                  variant="default" 
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => { setIsLoading(true); router.push(`/clients/${client?.id}/details/update`) }}
                >
                  <Pencil className="h-4 w-4 dark:text-white" />
                  <span className="dark:text-white">Update</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="h-full pt-0" style={{ paddingTop: 0 }}>
            <div className="grid grid-cols-2 gap-6 h-full">
              {/* Basic Information Column */}
              <div className="border-r dark:border-gray-700">
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Company Name</p>
                    <p className="text-lg font-medium dark:text-gray-100">{client?.name || "-"}</p>
                  </div>
                  
                  {/* <div>
                    <p className="text-sm text-muted-foreground">Short Name</p>
                    <p className="text-lg">{client?.shortName || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg">{client?.email || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg">{client?.phone_number || "-"}</p>
                  </div> */}

                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Address</p>
                    <p className="text-lg dark:text-gray-200">{client?.address || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">Created</p>
                    <p className="text-lg dark:text-gray-200">{formatDate(client?.created_at)}</p>
                  </div>
                </div>
              </div>
              {/* Additional Information Column */}
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Status</p>
                  {client?.status ? (
                    <Badge 
                      className={`${getClientStatusColor(client.status.name, 'bg-')} ${getClientStatusColor(client.status.name, 'text-').replace(/\d+$/, '700')} font-medium text-white hover:${getClientStatusColor(client.status.name, 'bg-')}`}
                    >
                      {client.status.name}
                    </Badge>
                  ) : (
                    <Badge 
                      className={
                        client?.active 
                          ? 'bg-green-500 text-white hover:bg-green-500' 
                          : 'bg-red-500 text-white hover:bg-red-500'
                      }
                    >
                      {client?.active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">VIP Status</p>
                  <Badge 
                    className={
                      client?.is_client_vip 
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
                    }
                  >
                    {client?.is_client_vip ? 'VIP' : 'Standard'}
                  </Badge>
                </div>

                {/* <div>
                  <p className="text-sm text-muted-foreground">Client Type</p>
                  <p className="text-lg">{client?.type || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="text-lg">{client?.serviceType || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Owner</p>
                  <p className="text-lg">{client?.owner || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Primary Contact</p>
                  <p className="text-lg">{client?.poc || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Parent Organization</p>
                  <p className="text-lg">{client?.parentOrg || "-"}</p>
                </div> */}
              </div>
            </div>

            {/* Full Width Information */}
            <div className="mt-6 space-y-4">
              {client?.description && (
                <div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Description</p>
                  <p className="text-lg dark:text-gray-200">{client.description}</p>
                </div>
              )}

              {client?.alertMessage && (
                <div>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">Alert Message</p>
                  <p className="text-lg text-red-600 dark:text-red-400">{client.alertMessage}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Panel>

      <PanelResizeHandle className="w-1 bg-border dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors" />

      {/* Recent Activity */}
      <Panel defaultSize={30} minSize={15}>
        <Card className="rounded-none border-0 h-full dark:bg-gray-900">
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="dark:text-gray-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground dark:text-gray-400">No recent activity</p>
          </CardContent>
        </Card>
      </Panel>

      <ClientEditDialog 
        client={client}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onSuccess={() => {
          // Refresh client data if needed
        }}
      />
    </PanelGroup>
  )
}

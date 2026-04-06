import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"

interface VipButtonProps {
  client: {
    name: string;
    is_client_vip: boolean;
    email?: string;
    phone?: string;
    address?: string;
    user?: any;
  }
}

export function VipButton({ client }: VipButtonProps) {
  if (!client.is_client_vip) return null;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="px-3 text-center font-bold 
          bg-amber-200 hover:bg-amber-100 border-2 border-amber-300 hover:border-amber-200 
          animate-pulse-border"
        >
          <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>
          <div className="">
            <div className="">
              <p className="text-md">
                <span className="font-bold">{client.name}</span> 
              </p>
              {/* {client.email && (
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {client.email}
                </p>
              )} */}
            </div>
            {client.user && (
              <div key={client.user.id} className="text-sm">
                <p>{client.user.email}</p>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

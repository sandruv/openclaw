'use client'

import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, MessageSquare, Mail, MessagesSquare } from 'lucide-react'
import { YW_PORTAL_COLORS } from '@/constants/colors'

interface ContactOption {
  icon: React.ReactNode
  label: string
  action: string
  color: string
  disabled?: boolean
}

export const YWPortalTools = () => {
  // Contact options with their respective icons and actions
  const contactOptions: ContactOption[] = [
    {
      icon: <Phone className="h-5 w-5" />,
      label: 'Call',
      action: 'tel:+19168901000',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'SMS',
      action: 'sms:+19168901000',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
      icon: <MessagesSquare className="h-5 w-5" />,
      label: 'Chat',
      action: '/dashboard/chat/support',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      disabled: true
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: 'Email',
      action: 'mailto:help@yanceyworks.com',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  ]

  // Handle contact action (for links or actions)
  const handleContactAction = (action: string) => {
    if (action.startsWith('/')) {
      // Internal route - would use router in a real implementation
      window.location.href = action;
    } else {
      // External link (tel:, mailto:, sms:)
      window.open(action, '_blank');
    }
  };

  return (
    <Card className={`h-full border-t-4 border-t-[${YW_PORTAL_COLORS.primary}] shadow-md`}>
      <CardHeader className="pb-2 flex items-center">
        <div className="mb-1">
          <Image 
            src="/yw-logo_only.svg" 
            alt="YW Portal" 
            width={48} 
            height={48} 
            className="mx-auto" 
          />
        </div>
        <CardTitle className="text-md font-medium text-center">YW Portal Support</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className={`border-green-500 border`}>
          <AlertDescription className="text-xs">
            Need assistance? Our support team is available 24/7. Choose your preferred contact method below.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-2 gap-3">
          {contactOptions.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              disabled={option.disabled}
              className={`flex flex-col items-center justify-center h-20 ${option.color} ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} transition-all`}
              onClick={option.disabled ? undefined : () => handleContactAction(option.action)}
            >
              <div className="flex flex-col items-center gap-2">
                {option.icon}
                <span className="text-xs font-medium">{option.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-center text-muted-foreground pt-0">
        <p className="w-full">Support hours: Monday-Friday, 8AM-6PM EST</p>
      </CardFooter>
    </Card>
  )
}

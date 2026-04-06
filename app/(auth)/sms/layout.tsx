"use client"
import { SMSLayout } from "@/components/sms"

interface SMSPageLayoutProps {
  children: React.ReactNode
}

export default function SMSPageLayout({ children }: SMSPageLayoutProps) {
  return <SMSLayout>{children}</SMSLayout>
}

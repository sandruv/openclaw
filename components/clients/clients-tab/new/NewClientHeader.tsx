'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export function NewClientHeader() {
  const router = useRouter()

  return (
    <div className="flex gap-4 items-center p-4 border-b">
      <Button
        variant="ghost"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-5 w-5" />
        Back
      </Button>

      <h1 className="text-xl font-semibold">Add New Client</h1>
    </div>
  )
}

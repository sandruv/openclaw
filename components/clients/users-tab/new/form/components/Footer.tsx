'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface FooterProps {
  isSubmitting: boolean
  onSubmit: () => void
}

export function Footer({ isSubmitting, onSubmit }: FooterProps) {
  const router = useRouter()

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
      <div className="container py-4 flex justify-end space-x-4">
        <Button
          className="h-10 w-50"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          className="h-10 w-[200px] bg-blue-500 hover:bg-blue-600 text-white"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create User"}
        </Button>
      </div>
    </div>
  )
}

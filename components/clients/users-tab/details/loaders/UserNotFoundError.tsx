'use client'

import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLoader } from "@/contexts/LoaderContext"

interface UserNotFoundErrorProps {
  title?: string
  message?: string
  showBackButton?: boolean
}

export function UserNotFoundError({ 
  title = "User Not Found",
  message = "The user you're looking for doesn't exist or has been deleted.",
  showBackButton = true 
}: UserNotFoundErrorProps) {
  const router = useRouter()
  const { setIsLoading } = useLoader()

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/50 dark:border-destructive/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Error Icon */}
            <div className="rounded-full bg-destructive/10 dark:bg-destructive/20 p-3">
              <AlertCircle className="h-10 w-10 text-destructive dark:text-red-400" />
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>

            {/* Error Message */}
            <p className="text-sm text-muted-foreground dark:text-gray-400 max-w-sm">
              {message}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              )}
              <Button
                onClick={() => { setIsLoading(true); router.push('/clients/users') }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                View All Users
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

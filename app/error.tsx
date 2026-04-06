'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <CardTitle className="text-3xl font-bold">Something went wrong!</CardTitle>
          </div>
          <CardDescription className="text-xl">
            We apologize for the inconvenience. An error has occurred.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-lg text-muted-foreground">
            Error details: {error.message || 'Unknown error'}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => window.location.href = '/'} className="text-lg px-6 py-3">
            Go to Homepage
          </Button>
          <Button onClick={() => reset()} className="text-lg px-6 py-3">Try again</Button>
        </CardFooter>
      </Card>
    </main>
  )
}
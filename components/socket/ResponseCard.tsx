'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ResponseCardProps {
  apiResponse: any
}

export function ResponseCard({ apiResponse }: ResponseCardProps) {
  if (!apiResponse) return null
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Response</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getTask } from '@/services/actions/getTask'

export default function TaskSearch() {
  const [input, setInput] = useState('')
  const [component, setComponent] = useState<React.ReactNode>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setComponent(<div className="animate-pulse">Processing your request...</div>)
    const result = await getTask(input)
    setComponent(result)
    setInput('')
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Task Search</h1>
          <p className="text-muted-foreground">
            Try asking:
            <br />
            "Show me the latest task"
            <br />
            "What are the high priority tasks?"
            <br />
            "Show me all open tasks"
          </p>
        </CardHeader>
        <CardContent className="min-h-[200px]">
          {component}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about task..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
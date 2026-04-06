'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Wand } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface PusherTestTriggerCardProps {
  onLog?: (type: string, data: any) => void;
}

export default function PusherTestTriggerCard({ onLog }: PusherTestTriggerCardProps) {
  const [channel, setChannel] = useState('task-11-channel')
  const [event, setEvent] = useState('task:update')
  const [data, setData] = useState(JSON.stringify({ message: 'Test message', timestamp: new Date().toISOString() }, null, 2))
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTrigger = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      // Parse the data
      const parsedData = JSON.parse(data)
      
      // Log the attempt
      if (onLog) {
        onLog('outgoing', {
          channel,
          event,
          data: parsedData,
          timestamp: new Date()
        });
      }

      // Send the request to the test trigger endpoint
      const res = await fetch('/api/pusher/test-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          channel,
          event,
          data: parsedData
        }),
      })
      
      const result = await res.json()
      setResponse(result)
      
      if (!res.ok) {
        setError(result.error || 'Failed to trigger event')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      console.error('Error triggering Pusher event:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pusher Test Trigger</CardTitle>
        <CardDescription>
          Send a test event to diagnose Pusher issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="channel">Channel</Label>
          <Input 
            id="channel" 
            value={channel} 
            onChange={(e) => setChannel(e.target.value)} 
            placeholder="Channel name" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="event">Event</Label>
          <Input 
            id="event" 
            value={event} 
            onChange={(e) => setEvent(e.target.value)}
            placeholder="Event name" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="data">Data (JSON)</Label>
          <Textarea 
            id="data" 
            value={data} 
            onChange={(e) => setData(e.target.value)} 
            placeholder="Event data in JSON format" 
            rows={5}
          />
        </div>
        
        <Button 
          onClick={handleTrigger} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Trigger Event'}
        </Button>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {response && !error && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Event was triggered successfully at {response.timestamp}
            </AlertDescription>
          </Alert>
        )}
        
        {response && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Response:</h4>
            <pre className="bg-slate-100 p-3 rounded-md text-xs overflow-auto max-h-[200px]">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

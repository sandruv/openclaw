'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSocket } from '@/services/socketService'

interface EventSenderCardProps {
  onSendEventViaApi: () => Promise<void>
  onGetConnectedClients: () => Promise<void>
  loading: boolean
}

export function EventSenderCard({ onSendEventViaApi, onGetConnectedClients, loading }: EventSenderCardProps) {
  const { isConnected, emit } = useSocket()
  const [customEvent, setCustomEvent] = useState('notification')
  const [customData, setCustomData] = useState('{"message":"Test notification"}')
  const [activeTab, setActiveTab] = useState('client')

  // Send event via client
  const sendEventViaClient = () => {
    try {
      let parsedData
      try {
        parsedData = JSON.parse(customData)
      } catch (e) {
        parsedData = { text: customData }
      }

      emit(customEvent, parsedData)
    } catch (error) {
      console.error('Error sending event via client:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Event Sender</CardTitle>
        <CardDescription>
          Send custom events to test socket communication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="client">Client-side</TabsTrigger>
            <TabsTrigger value="api">API-based</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <Input 
                  value={customEvent} 
                  onChange={(e) => setCustomEvent(e.target.value)} 
                  placeholder="notification"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Event Data (JSON)</label>
                <Input 
                  value={customData} 
                  onChange={(e) => setCustomData(e.target.value)} 
                  placeholder='{"message":"Hello world"}'
                />
              </div>
              
              <Button 
                onClick={sendEventViaClient} 
                disabled={!isConnected}
                className="w-full"
              >
                Send Event from Client
              </Button>
              
              {!isConnected && (
                <p className="text-sm text-red-500">
                  Socket not connected. Cannot send events.
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="api">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Name</label>
                <Input 
                  value={customEvent} 
                  onChange={(e) => setCustomEvent(e.target.value)} 
                  placeholder="notification"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Event Data (JSON)</label>
                <Input 
                  value={customData} 
                  onChange={(e) => setCustomData(e.target.value)} 
                  placeholder='{"message":"Hello world"}'
                />
              </div>
              
              <Button 
                onClick={onSendEventViaApi} 
                disabled={loading}
                className="w-full"
              >
                Send Event via API
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onGetConnectedClients} disabled={loading}>
          Get Connected Clients
        </Button>
        <div className="text-sm">
          Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

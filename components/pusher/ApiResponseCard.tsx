"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface ApiResponseCardProps {
  response: any;
  onClear: () => void;
}

const ApiResponseCard = ({ response, onClear }: ApiResponseCardProps) => {
  const [copied, setCopied] = React.useState(false);

  // Format JSON for display
  const formatJSON = (data: any): string => {
    try {
      if (typeof data === 'string') {
        // Try to parse if it's a JSON string
        try {
          const parsed = JSON.parse(data);
          return JSON.stringify(parsed, null, 2);
        } catch {
          return data;
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return String(data);
    }
  };

  const copyToClipboard = () => {
    if (!response) return;
    
    const text = formatJSON(response);
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const hasError = response && (response.error || (typeof response === 'object' && 'error' in response));
  const hasSuccess = response && (response.success || (typeof response === 'object' && 'success' in response));

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>API Response</CardTitle>
          {response && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 px-2"
                onClick={onClear}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
        <CardDescription className="flex items-center gap-2">
          Response from the Pusher API
          {response && hasError && (
            <Badge variant="destructive">Error</Badge>
          )}
          {response && hasSuccess && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
              Success
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] rounded-md border p-4 bg-muted/20">
          {!response ? (
            <div className="text-center text-muted-foreground py-8">
              No API response yet
            </div>
          ) : (
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {formatJSON(response)}
            </pre>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ApiResponseCard;

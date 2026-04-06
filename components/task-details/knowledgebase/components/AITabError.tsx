"use client"

import { AlertTriangle, Bot, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ReactMarkdown from 'react-markdown'

interface AITabErrorProps {
    error: string;
    onRefresh: () => void;
    isThinking: boolean;
}

export const AITabError = ({ error, onRefresh, isThinking }: AITabErrorProps) => {
    return (
        <div className="w-full">
            <div className="space-y-6 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5 text-blue-500" />
                        <h2 className="text-lg font-semibold">Assistant</h2>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isThinking}
                    >
                        <RefreshCw className={`h-4 w-4 ${isThinking ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <Card className="border-red-200 bg-red-50 mb-2">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-medium flex items-center text-red-900">
                            <AlertTriangle className="h-8 w-8 mr-2 pb-1 text-red-500" />
                            Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm max-w-none text-red-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                            <ReactMarkdown>
                                {error}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

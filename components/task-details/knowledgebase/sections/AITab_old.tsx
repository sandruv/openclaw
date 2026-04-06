"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { useAIStore } from "@/stores/useAIStore"
import { useDeepseekStore } from '@/stores/useDeepseekStore';
import { useGptStore } from '@/stores/useGptStore';
import { useGoogleStore } from '@/stores/useGoogleStore';
import { Bot, ArrowRight, RefreshCw, ArrowUpNarrowWide, Loader2, Link2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { logger } from "@/lib/logger"
import { AITabLoader } from "../loaders/AITabLoader"
import { AITabError } from "../components/AITabError"
import { useRouter } from "next/navigation"

export const AITab = () => {
    const router = useRouter()
    const { task, currentAction } = useTaskDetailsStore()
    const { analyzeTicket, ticketAnalysis, error, isThinking, initializing } = useAIStore()

    const deepseekStore = useDeepseekStore();
    const gptStore = useGptStore();
    const googleStore = useGoogleStore();

    const [loading, setLoading] = useState(false)
    const [prevSummary, setPrevSummary] = useState<string | undefined>()

    const fetchAnalysis = useCallback(async (forceRefresh = false) => {
        try {
            if (task?.summary) {
                await analyzeTicket(task.summary, forceRefresh)
            }
        } catch (error) {
            logger.error('Error analyzing task:', error)
        }
    }, [task?.summary, analyzeTicket])

    useEffect(() => {
        // Run analysis if:
        // 1. We have a task but no analysis yet
        // 2. The task summary has changed from what we previously analyzed
        if (task?.summary && 
            (!ticketAnalysis || task.summary !== prevSummary)) {
            fetchAnalysis(false)
        }
        
        // Update prevSummary after checking conditions
        if (task?.summary) {
            setPrevSummary(task.summary)
        }
    }, [task?.summary, ticketAnalysis, fetchAnalysis, prevSummary])

    const handleTransferToAssistant = async () => {
        setLoading(true)
        // Combine task summary and AI analysis as context
        const context = `
## Task Summary
${task?.summary || ''}

## AI Analysis
${ticketAnalysis?.analysis || ''}
`.trim();

        try {
            // Generate responses using all models and search
            const [deepseekResponse, gptResponse, googleResponse] = await Promise.all([
                deepseekStore.generateResponse(context),
                gptStore.generateResponse(context),
                googleStore.generateSearch(task?.summary || '')
            ]);

            // Handle any errors
            if (deepseekResponse.error || gptResponse.error || googleResponse.message) {
                console.error('Error generating responses:', {
                    deepseek: deepseekResponse.error,
                    gpt: gptResponse.error,
                    google: googleResponse.message
                });
            }

            // Navigate to assistant page
            router.push(`/assistant`);
        } catch (error) {
            console.error('Error in handleTransferToAssistant:', error);
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return <AITabLoader />
    }

    if (error) {
        return (
            <AITabError 
                error={error}
                onRefresh={() => fetchAnalysis(true)}
                isThinking={isThinking}
            />
        )
    }

    if (!ticketAnalysis) {
        return null
    }

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
                        onClick={() => fetchAnalysis(true)}
                        disabled={isThinking}
                    >
                        <RefreshCw className={`h-4 w-4 ${isThinking ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-135px)]" style={{ marginTop: '10px' }}>
                    {ticketAnalysis.analysis && (
                        <Card className="border-blue-200 bg-blue-50 mb-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Bot className="h-4 w-4 mr-2 pb-1 text-blue-500" />
                                    Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none text-blue-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown>
                                        {ticketAnalysis.analysis}
                                    </ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {ticketAnalysis.steps && (
                        <Card className="border-green-200 bg-green-50 mb-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                                    Next Steps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none text-green-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown>
                                        {ticketAnalysis.steps}
                                    </ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {ticketAnalysis.links && (
                        <Card className="border-blue-200 bg-blue-50 mb-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Link2 className="h-4 w-4 mr-2 pb-1 text-blue-500" />
                                    Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm max-w-none text-blue-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown>
                                        {ticketAnalysis.links}
                                    </ReactMarkdown>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                    {(ticketAnalysis?.analysis || ticketAnalysis?.steps) && (
                        <div className="mt-4 flex justify-end">
                            <Button 
                                variant="outline" 
                                onClick={handleTransferToAssistant}
                                className="text-sm"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing
                                    </>
                                ) : (
                                    <>
                                        Continue Analysis 
                                        <ArrowUpNarrowWide className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}
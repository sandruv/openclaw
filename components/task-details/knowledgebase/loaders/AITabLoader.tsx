import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, ArrowRight, RefreshCw } from "lucide-react"

export function AITabLoader() {
    return (
        <div className="w-full">
            <div>
                <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5 text-blue-500" />
                        <h2 className="text-lg font-semibold dark:text-white">Assistant</h2>
                    </div>
                    <Skeleton className="h-8 w-20 rounded-md" /> {/* Refresh button skeleton */}
                </div>

                <ScrollArea className="h-[calc(100vh-115px)] px-4 pr-3">
                    {/* Analysis Card */}
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 mb-2 mt-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center">
                                <Bot className="h-4 w-4 mr-2 pb-1 text-blue-500" />
                                <span className="text-blue-900 dark:text-blue-200">Analysis</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[95%]" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[75%]" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[85%]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Steps Card */}
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50 mb-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center">
                                <ArrowRight className="h-4 w-4 mr-2 text-green-500" />
                                <span className="text-green-900 dark:text-green-200">Next Steps</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-[95%]" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[75%]" />
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[90%]" />
                                <Skeleton className="h-4 w-[85%]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Continue Analysis Button */}
                    <div className="mt-4 flex justify-end">
                        <Skeleton className="h-9 w-32 rounded-md" />
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

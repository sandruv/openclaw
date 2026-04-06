import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, ArrowRight, Mail } from "lucide-react"

export function AIContentLoader() {
    return (
        <div>
            <ScrollArea className="h-[calc(100vh-135px)] px-4 pr-3">
                {/* Enhanced Analysis Context Card */}
                <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50 mb-2 mt-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Mail className="h-4 w-4 mr-2 pb-1 text-purple-500" />
                            <span className="text-purple-900 dark:text-purple-200">Enhanced Analysis Context</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="!pt-0">
                        <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-[95%]" />
                            <Skeleton className="h-4 w-[80%]" />
                        </div>
                    </CardContent>
                </Card>

                {/* Analysis Card */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50 mb-2 mt-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Bot className="h-4 w-4 mr-2 pb-1 text-blue-500" />
                            <span className="text-blue-900 dark:text-blue-200">Analysis</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="!pt-0">
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
                    <CardContent className="!pt-0">
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
    )
}

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AITab } from "./sections/AITab"
import { KBTab } from "./sections/KBTab"
import { InteractTab } from "./sections/InteractTab"
import { cn } from "@/lib/utils"
import { useTaskDetailsStore } from "@/stores/useTaskDetailsStore"
import { KnowledgeBaseSkeleton } from "./loaders/KnowledgeBaseSkeleton"

const removeRadius = "rounded-none"

export default function KnowledgeBase() {
    const { task } = useTaskDetailsStore()
    const [activeTab, setActiveTab] = useState("ai")
    const [initialContext, setInitialContext] = useState<string | null>(null)

    const handleSwitchToInteract = (context: string) => {
        setInitialContext(context)
        setActiveTab("interact")
    }

    if (!task) {
        return <KnowledgeBaseSkeleton />
    }

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full", removeRadius)}>
            <TabsContent key="ai" value="ai" className={cn("mt-0", removeRadius)}>
                <div className="p-0">
                    <AITab onSwitchToInteract={handleSwitchToInteract} />
                </div>
            </TabsContent>
            <TabsContent key="kb" value="kb" className={removeRadius}>
                <div className="p-2 pt-0">
                    <KBTab />
                </div>
            </TabsContent>
            <TabsContent key="interact" value="interact" className={removeRadius}>
                <div className="p-0">
                    <InteractTab initialContext={initialContext} />
                </div>
            </TabsContent>
        </Tabs>
    )
}


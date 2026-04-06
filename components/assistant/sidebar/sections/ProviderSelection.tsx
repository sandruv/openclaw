"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useAIStore } from "@/stores/useAIStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  PROVIDER_NAMES, 
  PROVIDER_DESCRIPTIONS, 
  PROVIDER_COLORS,
  PROVIDER_AVAILABILITY,
  type Provider 
} from "@/lib/aiProviders";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function ProviderSelection() {
  const { 
    models, 
    selectedProvider,
    initializing,
    isLoading,
    setIsLoading,
    setSelectedProvider,
    setMessages
  } = useAIStore();

  const [viewProvider, setviewProvider] = useState(selectedProvider);

  const providerModels = models.filter(model => model.provider === viewProvider);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold mr-2">AI Providers</h2>
        {selectedProvider && (
          <Badge 
            variant="secondary" 
            className={cn(
              "text-white",
              
              PROVIDER_COLORS[selectedProvider as Provider]
            )}
          >
            {PROVIDER_NAMES[selectedProvider as Provider]}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROVIDER_NAMES).map(([key, name]) => (
              <Button
                key={key}
                variant="secondary"
                size="sm"
                className={cn(
                  "transition-colors text-white",
                  key === viewProvider 
                    ? PROVIDER_COLORS[key as Provider]
                    : "bg-muted hover:bg-muted/80 text-foreground",
                )}
                onClick={async () => {
                  // Only show details, don't select the provider yet
                  setviewProvider(key as Provider);
                }}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>

        {viewProvider && (
          <Accordion type="single" collapsible defaultValue="details">
            <AccordionItem value="details" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {PROVIDER_NAMES[viewProvider as Provider]} Details
                  </span>

                  {(!PROVIDER_AVAILABILITY[viewProvider as Provider]) && (
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      Coming Soon
                    </Badge>
                  )}
                  
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 px-4 pb-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">About</h3>
                    <p className="text-sm text-muted-foreground">
                      {PROVIDER_DESCRIPTIONS[viewProvider as Provider]}
                    </p>
                  </div>

                  {initializing ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Available Models</h3>
                      <div className="grid gap-2">
                        {providerModels.map((model) => (
                          <Card 
                            key={model.id} 
                            className={cn(
                              "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                            )}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">{model.name}</h4>

                                <div className="flex gap-1">
                                  {model.capabilities.map((cap) => (
                                    <Badge 
                                      key={cap}
                                      variant="secondary" 
                                      className="bg-primary/20 text-primary hover:bg-primary/20"
                                    >
                                      {cap}
                                    </Badge>
                                  ))}
                                </div>
                                
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="default"
                    className={cn(
                      "w-full text-white",
                      PROVIDER_COLORS[viewProvider as Provider]
                    )}
                    disabled={!PROVIDER_AVAILABILITY[viewProvider as Provider] || isLoading || viewProvider === selectedProvider}
                    onClick={async () => {
                      // If there are models available for this provider, select the first one
                      if (providerModels.length > 0) {   
                        setIsLoading(true);                     
                        
                        // Add delay before changing provider
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        setSelectedProvider(viewProvider as Provider);
                      
                        // Clear messages first
                        setMessages([]);

                        setIsLoading(false);
                      }
                    }}
                  >
                    {/* { providerModels } */}
                    Use {PROVIDER_NAMES[viewProvider as Provider]}
                    {isLoading  && <Loader2 className="ml-2 animate-spin" />}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGptStore } from '@/stores/useGptStore';
import { useAIStore } from '@/stores/useAIStore';
import { Label } from '@/components/ui/label';
import { Spinner } from "@/components/ui/spinner";

export function ModelSelector() {
  const { models, selectedModel, setSelectedModel, fetchModels, isLoading } = useGptStore();
  const { setIsLoading, setMessages } = useAIStore();

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleModelChange = async (modelId: string) => {
    setIsLoading(true);
    setMessages([]);
    
    // Add delay before changing model
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSelectedModel(modelId);
    setIsLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="model-select">Model</Label>
        {isLoading && <Spinner size="sm" className="text-muted-foreground" />}
      </div>
      <Select
        value={selectedModel}
        onValueChange={handleModelChange}
        disabled={isLoading}
      >
        <SelectTrigger id="model-select" className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models
            .filter(model => {
              const modelId = model.id.toLowerCase();
              const isGPTModel = modelId.includes('gpt-3') || modelId.includes('gpt-4');
              const excludeKeywords = !modelId.includes('realtime') && !modelId.includes('audio');
              return isGPTModel && excludeKeywords;
            })
            .map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading models...</p>
      )}
    </div>
  );
}

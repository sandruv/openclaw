"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ModelSelector } from "./sections/ModelSelector";

export function GPTSettings() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">ChatGPT Settings</h2>
        <p className="text-sm text-muted-foreground">
          Customize ChatGPT behavior
        </p>
      </div>

      <Card className="p-4 space-y-6">
        <div className="space-y-4">
          <ModelSelector />

          <div className="flex items-center justify-between">
            <Label htmlFor="streaming" className="text-sm font-medium">
              Streaming Responses
              <span className="block text-xs text-muted-foreground">
                Show responses as they are generated
              </span>
            </Label>
            <Switch id="streaming" disabled={true} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp" className="text-sm font-medium">
              Temperature
              <span className="block text-xs text-muted-foreground">
                Controls randomness in responses (0 = focused, 1 = creative)
              </span>
            </Label>
            <Slider
              id="temp"
              min={0}
              max={1}
              step={0.1}
              defaultValue={[0.7]}
              color="primary"
              className="w-full bg-muted text-muted-foreground"
              disabled={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens" className="text-sm font-medium">
              Max Response Length
              <span className="block text-xs text-muted-foreground">
                Maximum number of tokens in response
              </span>
            </Label>
            <Slider
              id="maxTokens"
              min={100}
              max={4000}
              step={100}
              defaultValue={[1000]}
              className="w-full"
              disabled={true}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
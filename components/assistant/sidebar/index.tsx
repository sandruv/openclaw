import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProviderSelection } from "./sections/ProviderSelection";
import { GPTSettings } from "./gpt-settings";
import { useAIStore } from "@/stores/useAIStore";
import ComingSoon from "./components/ComingSoon";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export function Sidebar({ isCollapsed, onToggle, className }: SidebarProps) {
  const { selectedProvider } = useAIStore();

  const renderProviderSettings = () => {
    switch (selectedProvider) {
      case 'openai':
        return <GPTSettings />;
      case 'anthropic':
        return <ComingSoon 
          title="Claude Settings" 
          description="Anthropic Claude settings and configurations will be available here soon." 
        />;
      case 'deepseek':
        return <ComingSoon 
          title="DeepSeek Settings" 
          description="DeepSeek model settings and configurations will be available here soon." 
        />;
      case 'google':
        return <ComingSoon 
          title="Gemini Settings" 
          description="Google Gemini settings and configurations will be available here soon." 
        />;
      case 'github':
        return <ComingSoon 
          title="Copilot Settings" 
          description="GitHub Copilot settings and configurations will be available here soon." 
        />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative border-l bg-background transition-all duration-300",
        isCollapsed ? "w-[20px]" : "w-[450px]",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        style={{ zIndex: 10 }}
        className="absolute -left-5 top-3 h-8 w-8 border bg-background z-10"
        onClick={onToggle}
      >
        {isCollapsed ? (
          <Menu className="h-4 w-4" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
      
      <ScrollArea className="h-full w-full">
        <div className={cn("p-4", isCollapsed && "hidden")}>
          <div className="space-y-6">
            <ProviderSelection />
            {renderProviderSettings()}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

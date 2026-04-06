import { cn } from "@/lib/utils"

interface AnimatedMicrosoftLogoProps {
  className?: string
}

export function AnimatedMicrosoftLogo({ className }: AnimatedMicrosoftLogoProps) {
  return (
    <div className={cn("w-24 h-24 grid grid-cols-2 gap-2", className)}>
      {/* Red box - top left */}
      <div 
        className="bg-[#F25022] animate-pulse"
        style={{ animationDelay: '0ms', animationDuration: '2s' }}
      />
      
      {/* Green box - top right */}
      <div 
        className="bg-[#7FBA00] animate-pulse"
        style={{ animationDelay: '500ms', animationDuration: '2s' }}
      />
      
      {/* Blue box - bottom left */}
      <div 
        className="bg-[#00A4EF] animate-pulse"
        style={{ animationDelay: '1000ms', animationDuration: '2s' }}
      />
      
      {/* Yellow box - bottom right */}
      <div 
        className="bg-[#FFB900] animate-pulse"
        style={{ animationDelay: '1500ms', animationDuration: '2s' }}
      />
    </div>
  )
}

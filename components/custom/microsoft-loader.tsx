import { cn } from "@/lib/utils"

interface MicrosoftLoaderProps {
  className?: string
}

export function MicrosoftLoader({ className }: MicrosoftLoaderProps) {
  return (
    <div className={cn("relative w-12 h-12", className)}>
      <style jsx>{`
        @keyframes spin-dots {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .dot {
          animation: spin-dots 1.5s linear infinite;
          transform-origin: center;
        }
      `}</style>
      
      <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="dot">
          {/* Top dot */}
          <circle cx="24" cy="4" r="3" fill="currentColor" opacity="1" />
          {/* Top-right dot */}
          <circle cx="35.5" cy="8.5" r="3" fill="currentColor" opacity="0.9" />
          {/* Right dot */}
          <circle cx="44" cy="24" r="3" fill="currentColor" opacity="0.8" />
          {/* Bottom-right dot */}
          <circle cx="35.5" cy="39.5" r="3" fill="currentColor" opacity="0.7" />
          {/* Bottom dot */}
          <circle cx="24" cy="44" r="3" fill="currentColor" opacity="0.6" />
          {/* Bottom-left dot */}
          <circle cx="12.5" cy="39.5" r="3" fill="currentColor" opacity="0.5" />
          {/* Left dot */}
          <circle cx="4" cy="24" r="3" fill="currentColor" opacity="0.4" />
          {/* Top-left dot */}
          <circle cx="12.5" cy="8.5" r="3" fill="currentColor" opacity="0.3" />
        </g>
      </svg>
    </div>
  )
}

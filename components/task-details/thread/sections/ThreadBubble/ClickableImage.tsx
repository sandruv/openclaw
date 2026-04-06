import Image from "next/image"
import { shouldUseNextImage } from "./utils"

interface ClickableImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  onImageClick: (src: string, alt: string) => void
}

export function ClickableImage({ 
  src, 
  alt, 
  width = 400, 
  height = 200,
  onImageClick 
}: ClickableImageProps) {
  const displayWidth = Math.min(width, 600)
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onImageClick(src, alt)
  }

  const sharedClassName = "cursor-pointer hover:opacity-90 transition-opacity max-w-full rounded-md border border-gray-200 dark:border-gray-700 block my-2"
  const sharedStyle = { 
    maxHeight: '300px', 
    width: 'auto',
    display: 'block' as const
  }

  if (shouldUseNextImage(src)) {
    return (
      <Image 
        src={src} 
        alt={alt} 
        width={displayWidth}
        height={height}
        className={sharedClassName}
        onClick={handleClick}
        style={sharedStyle}
        unoptimized
      />
    )
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} 
        alt={alt} 
        width={displayWidth}
        height="auto"
        className={sharedClassName}
        onClick={handleClick}
        style={sharedStyle}
      />
    </>
  )
}

interface StarIconProps {
  color: string
  size?: number
  className?: string
}

export function StarIcon({ color, size = 24, className = '' }: StarIconProps) {
  // Generate gradient colors based on the base color
  // This creates a gradient effect similar to the original SVG
  const generateGradient = (baseColor: string) => {
    // Parse hex color to RGB
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Create darker shade for top (reduce brightness)
    const darkR = Math.max(0, Math.floor(r * 0.4))
    const darkG = Math.max(0, Math.floor(g * 0.4))
    const darkB = Math.max(0, Math.floor(b * 0.4))
    
    // Create lighter shade for bottom (increase brightness)
    const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.6))
    const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.6))
    const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.6))
    
    return {
      dark: `rgb(${darkR}, ${darkG}, ${darkB})`,
      mid: baseColor,
      light: `rgb(${lightR}, ${lightG}, ${lightB})`,
    }
  }
  
  const gradient = generateGradient(color)
  const gradientId = `star-gradient-${color.replace('#', '')}`
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 30 30" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M15 0L16.9522 7.80899C17.3332 9.33277 17.5237 10.0947 17.9204 10.7146C18.2713 11.263 18.737 11.7287 19.2854 12.0796C19.9053 12.4763 20.6672 12.6668 22.191 13.0478L30 15L22.191 16.9522C20.6672 17.3332 19.9053 17.5237 19.2854 17.9204C18.737 18.2713 18.2713 18.737 17.9204 19.2854C17.5237 19.9053 17.3332 20.6672 16.9522 22.191L15 30L13.0478 22.191C12.6668 20.6672 12.4763 19.9053 12.0796 19.2854C11.7287 18.737 11.263 18.2713 10.7146 17.9204C10.0947 17.5237 9.33277 17.3332 7.80898 16.9522L0 15L7.80899 13.0478C9.33277 12.6668 10.0947 12.4763 10.7146 12.0796C11.263 11.7287 11.7287 11.263 12.0796 10.7146C12.4763 10.0947 12.6668 9.33277 13.0478 7.80898L15 0Z" 
        fill={`url(#${gradientId})`}
      />
      <defs>
        <linearGradient 
          id={gradientId} 
          x1="15" 
          y1="0" 
          x2="15" 
          y2="28" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={gradient.dark} />
          <stop offset="0.418255" stopColor={gradient.mid} />
          <stop offset="1" stopColor={gradient.light} />
        </linearGradient>
      </defs>
    </svg>
  )
}

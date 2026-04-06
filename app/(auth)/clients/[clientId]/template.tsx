'use client'

interface TemplateProps {
  children: React.ReactNode
}

export default function Template({ children }: TemplateProps) {
  return (
    <div className="container max-w-full">
      {children}
    </div>
  )
}

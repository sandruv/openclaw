'use client'

interface TimeDisplayProps {
  currentTime: Date
}

export const TimeDisplay = ({ currentTime }: TimeDisplayProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toUpperCase()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="text-right">
      <div className="text-white text-xs font-medium">{formatTime(currentTime)}</div>
      <div className="text-zinc-400 text-[10px]">{formatDate(currentTime)}</div>
    </div>
  )
}

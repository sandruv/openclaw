import { useState, useEffect } from 'react'

export function useLoadingWithMinTime(isLoading: boolean, minLoadingTime: number = 1000) {
  const [isLoadingWithMinTime, setIsLoadingWithMinTime] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsLoadingWithMinTime(false)
      }, minLoadingTime)

      return () => clearTimeout(timer)
    } else {
      setIsLoadingWithMinTime(true)
    }
  }, [isLoading, minLoadingTime])

  return isLoadingWithMinTime
}

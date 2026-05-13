'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'

const loadingMessages = [
  'Analyzing report...',
  'Extracting attack indicators...',
  'Mapping to MITRE ATT&CK...',
  'Generating SIEM rule...',
  'Generating SOAR playbook...',
  'Finalizing analysis...',
]

export function LoadingSpinner() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <Spinner className="h-16 w-16 text-primary relative" />
      </div>
      <p className="text-lg font-medium text-foreground animate-pulse">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  )
}

'use client'

import { Upload, Search, Link, Rocket, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Stage } from '@/lib/types'

const stages: { id: Stage; label: string; icon: React.ElementType }[] = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'analysis', label: 'Analysis', icon: Search },
  { id: 'correlation', label: 'Correlation', icon: Link },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
  { id: 'complete', label: 'Complete', icon: CheckCircle },
]

interface ProgressBarProps {
  currentStage: Stage
  maxReachedStage: Stage
  onStageClick?: (stage: Stage) => void
}

export function ProgressBar({ currentStage, maxReachedStage, onStageClick }: ProgressBarProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage)
  const maxReachedIndex = stages.findIndex(s => s.id === maxReachedStage)

  const handleClick = (stage: Stage, index: number) => {
    if (onStageClick && index <= maxReachedIndex) {
      onStageClick(stage)
    }
  }

  return (
    <div className="fixed top-16 left-0 right-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto max-w-2xl px-4 py-2">
        <div className="relative flex items-center justify-between">

          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />

          <div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-primary transition-all duration-500"
            style={{ width: `${(maxReachedIndex / (stages.length - 1)) * 100}%` }}
          />

          {stages.map((stage, index) => {
            const Icon = stage.icon
            const isActive = stage.id === currentStage
            const isReached = index <= maxReachedIndex
            const isClickable = index <= maxReachedIndex

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => handleClick(stage.id, index)}
                disabled={!isClickable}
                className={cn(
                  'relative z-10 flex flex-col items-center gap-1 bg-transparent border-none p-0',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300',
                    isActive && 'border-primary bg-primary text-primary-foreground ring-2 ring-primary/50',
                    !isActive && isReached && 'border-primary bg-primary text-primary-foreground',
                    !isReached && 'border-border bg-card text-muted-foreground'
                  )}
                >
                  <Icon className="h-3 w-3" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive && 'text-primary',
                    !isActive && isReached && 'text-primary',
                    !isReached && 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
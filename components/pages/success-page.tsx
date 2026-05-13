'use client'

import { Server, Workflow, Target, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { DeploymentResult } from '@/lib/types'

interface SuccessPageProps {
  result: DeploymentResult
  onRestart: () => void
}

export function SuccessPage({ result, onRestart }: SuccessPageProps) {
  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-2xl w-full text-center">
        {/* Animated checkmark */}
        <div className="mb-8 flex justify-center">
          <svg
            className="check-animation h-32 w-32"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#00ff88"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M30 50 L45 65 L70 35"
              stroke="#00ff88"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-success mb-2">
          Protection Deployed Successfully
        </h2>
        <p className="text-muted-foreground mb-8">
          Your security rules and playbook have been pushed to your tools
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Server className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">SIEM Rule</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {result.siem}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Workflow className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">SOAR Playbook</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {result.soar}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">MITRE Techniques</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.techniques.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs font-mono font-bold rounded bg-primary/20 text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Deployed At</p>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {result.timestamp}
              </p>
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={onRestart}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Analyze Another Report
        </Button>
      </div>
    </div>
  )
}

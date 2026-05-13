 'use client'

import { Shield, Link, Target, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CorrelationResult, AttackChainStep, TimelineEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CorrelationPageProps {
  correlation: CorrelationResult
  onContinue: () => void
}

function RiskScoreMeter({ score }: { score: number }) {
  const percentage = (score / 10) * 100

  const color =
    score >= 8 ? 'bg-destructive' :
    score >= 5 ? 'bg-warning' :
    'bg-success'

  const textColor =
    score >= 8 ? 'text-destructive' :
    score >= 5 ? 'text-warning' :
    'text-success'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Overall Risk Score</span>
        <span className={cn('text-3xl font-bold', textColor)}>
          {score.toFixed(1)}
          <span className="text-sm text-muted-foreground font-normal"> / 10</span>
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function CorrelationPage({ correlation, onContinue }: CorrelationPageProps) {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-12">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Link className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Correlation Analysis
            </h1>
          </div>
          <p className="text-muted-foreground">
            AI analysis of how all detected attacks relate to each other
          </p>
        </div>

        {/* Are Attacks Related */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Are these attacks related?
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  correlation.are_related
                    ? 'text-destructive'
                    : 'text-success'
                )}>
                  {correlation.are_related
                    ? '⚠ YES — Coordinated Attack'
                    : '✓ NO — Separate Incidents'}
                </p>
                <p className="text-sm text-foreground mt-2">
                  {correlation.relationship_explanation}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-4 min-w-[120px]">
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <p className="text-3xl font-bold text-primary">
                  {correlation.confidence_percentage}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RiskScoreMeter score={correlation.overall_risk_score} />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Attack Pattern
              </p>
              <p className="text-lg font-semibold text-foreground">
                {correlation.attack_pattern}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Why this score
              </p>
              <p className="text-foreground">
                {correlation.risk_explanation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attacker Goal */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Attacker Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-lg">
              {correlation.attacker_goal}
            </p>
          </CardContent>
        </Card>

        {/* Attack Chain */}
        {correlation.attack_chain.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ChevronRight className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Attack Chain
              </h2>
            </div>

            <div className="space-y-4">
              {correlation.attack_chain.map((step: AttackChainStep, index: number) => (
                <div key={index} className="relative">
                  <Card className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {step.step}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm text-primary font-bold">
                              {step.mitre_id}
                            </span>
                            <span className="font-semibold text-foreground">
                              {step.attack_name}
                            </span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {step.tactic}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            {step.what_happened}
                          </p>
                          {index < correlation.attack_chain.length - 1 && (
                            <p className="text-sm text-primary mt-2 italic">
                              → {step.led_to_next}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {index < correlation.attack_chain.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ChevronRight className="h-6 w-6 text-primary rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {correlation.timeline.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Attack Timeline
              </h2>
            </div>

            <div className="relative border-l-2 border-primary/30 pl-6 space-y-6">
              {correlation.timeline.map((event: TimelineEvent, index: number) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[29px] h-4 w-4 rounded-full bg-primary border-2 border-background" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-primary">
                        {event.time}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {event.mitre_id}
                      </span>
                    </div>
                    <p className="text-foreground">
                      {event.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Priority Action */}
        {correlation.priority_action?.mitre_id && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Priority Action Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-primary font-bold">
                  {correlation.priority_action.mitre_id}
                </span>
                <span className="font-semibold text-foreground">
                  {correlation.priority_action.attack_name}
                </span>
              </div>
              <p className="text-foreground">
                {correlation.priority_action.reason}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {correlation.recommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Recommendations
              </h2>
            </div>

            <div className="space-y-3">
              {correlation.recommendations.map((rec: string, index: number) => (
                <Card key={index} className="bg-card border-border">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="text-foreground">{rec}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Continue Button */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={onContinue}
            className="h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue to Deploy
          </Button>
        </div>

      </div>
    </div>
  )
}
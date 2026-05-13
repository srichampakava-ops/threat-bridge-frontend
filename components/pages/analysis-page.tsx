 'use client'

import { Radar, Target, Server, Workflow } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/code-block'
import { EvidenceBox } from '@/components/evidence-box'
import type { AnalysisResult, Severity } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AnalysisPageProps {
  result: AnalysisResult
  onDeploy: () => void
}

const severityStyles: Record<Severity, string> = {
  HIGH: 'bg-destructive/20 text-destructive border-destructive/30',
  MEDIUM: 'bg-warning/20 text-warning border-warning/30',
  LOW: 'bg-success/20 text-success border-success/30',
}

export function AnalysisPage({ result, onDeploy }: AnalysisPageProps) {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-12">

        {/* Section A - Attack Discovery */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Radar className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Attack Discovery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Attack Type
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {result.attackDiscovery.attackType}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Target System
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {result.attackDiscovery.targetSystem}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Timeframe
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {result.attackDiscovery.timeframe}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">
                  Impact
                </p>
                <p className="text-lg font-semibold text-destructive">
                  {result.attackDiscovery.impact}
                </p>
              </CardContent>
            </Card>
          </div>

          {result.attackDiscovery.evidence &&
            result.attackDiscovery.evidence.length > 0 && (
              <EvidenceBox evidence={result.attackDiscovery.evidence} />
          )}
        </section>

        {/* Section B - MITRE ATT&CK Mapping */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              MITRE ATT&CK Mapping
            </h2>
          </div>

          <div className="space-y-4">
            {result.mitreTechniques.map((technique) => (
              <Card key={technique.id} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xl font-mono font-bold text-primary">
                        {technique.id}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {technique.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {technique.tactic}
                      </p>
                      <p className="text-sm text-foreground mt-2">
                        {technique.explanation}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold border',
                        severityStyles[technique.severity]
                      )}
                    >
                      {technique.severity}
                    </span>
                  </div>

                  {technique.evidence &&
                    technique.evidence.length > 0 && (
                      <EvidenceBox evidence={technique.evidence} />
                  )}

                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                    {technique.severity === 'HIGH' && (
                      <p className="text-sm text-destructive font-medium">
                        ⚠ HIGH severity — SIEM rule and SOAR playbook will be generated
                      </p>
                    )}
                    {technique.severity === 'MEDIUM' && (
                      <p className="text-sm text-warning font-medium">
                        ⚡ MEDIUM severity — SIEM rule only will be generated
                      </p>
                    )}
                    {technique.severity === 'LOW' && (
                      <p className="text-sm text-success font-medium">
                        ✓ LOW severity — No rules or playbooks generated, monitor only
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section C and D - Rules for ALL findings */}
        {result.allFindings.map((finding, index) => (
          <div key={index}>

            {/* SIEM Rule - HIGH and MEDIUM only */}
            {(finding.severity === 'HIGH' ||
              finding.severity === 'MEDIUM') && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {finding.mitre_id} — Generated {finding.siem} Rule
                  </h2>
                </div>

                <Card className="bg-card border-border mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">📋 Explanation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Simple explanation for juniors */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <p className="text-xs font-bold text-primary mb-2">
                        🟢 Simple Explanation
                      </p>
                      <p className="text-foreground text-sm">
                        {finding.siem_rule?.simpleExplanation ||
                         finding.siem_rule?.whatItDoes || ''}
                      </p>
                    </div>

                    {/* Technical detail for seniors */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <p className="text-xs font-bold text-primary mb-2">
                        🔵 Technical Detail
                      </p>
                      <p className="text-foreground text-sm font-mono">
                        {finding.siem_rule?.technicalDetail ||
                         finding.siem_rule?.howItTriggers || ''}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        What it detects
                      </p>
                      <p className="text-foreground">
                        {finding.siem_rule?.whatItDetects || ''}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Why it was generated
                      </p>
                      <p className="text-foreground">
                        {finding.siem_rule?.whyGenerated || ''}
                      </p>
                      {finding.siem_rule?.evidence && (
                        <p className="text-sm italic text-primary mt-2 pl-3 border-l-2 border-primary">
                          "{finding.siem_rule.evidence}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <CodeBlock
                  title="Rule Code"
                  code={
                    typeof finding.siem_rule?.code === 'string'
                      ? finding.siem_rule.code
                      : JSON.stringify(finding.siem_rule?.code || {}, null, 2)
                  }
                  filename={`${finding.mitre_id}_${finding.siem}_rule.txt`}
                />
              </section>
            )}

            {/* SOAR Playbook - HIGH only */}
            {finding.severity === 'HIGH' &&
              finding.soar_playbook !== null &&
              finding.soar_playbook !== undefined && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Workflow className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {finding.mitre_id} — Generated {finding.soar} Playbook
                  </h2>
                </div>

                <Card className="bg-card border-border mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">📋 Explanation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    {/* Simple explanation for juniors */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <p className="text-xs font-bold text-primary mb-2">
                        🟢 Simple Explanation
                      </p>
                      <p className="text-foreground text-sm">
                        {finding.soar_playbook?.simpleExplanation ||
                         finding.soar_playbook?.whatItDoes || ''}
                      </p>
                    </div>

                    {/* Technical detail for seniors */}
                    <div className="p-3 rounded-lg bg-muted/20 border border-border">
                      <p className="text-xs font-bold text-primary mb-2">
                        🔵 Technical Detail
                      </p>
                      <p className="text-foreground text-sm font-mono">
                        {finding.soar_playbook?.technicalDetail ||
                         finding.soar_playbook?.whyGenerated || ''}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Step by step actions
                      </p>
                      <ol className="list-decimal list-inside space-y-2 text-foreground">
                        {Array.isArray(finding.soar_playbook?.steps) &&
                          finding.soar_playbook.steps.map((step: string, i: number) => (
                            <li key={i}>{step}</li>
                          ))
                        }
                      </ol>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Why it was generated
                      </p>
                      <p className="text-foreground">
                        {finding.soar_playbook?.whyGenerated || ''}
                      </p>
                      {finding.soar_playbook?.evidence && (
                        <p className="text-sm italic text-primary mt-2 pl-3 border-l-2 border-primary">
                          "{finding.soar_playbook.evidence}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <CodeBlock
                  title="Playbook Code"
                  code={
                    typeof finding.soar_playbook?.code === 'string'
                      ? finding.soar_playbook.code
                      : JSON.stringify(finding.soar_playbook?.code || {}, null, 2)
                  }
                  filename={`${finding.mitre_id}_${finding.soar}_playbook.txt`}
                />
              </section>
            )}

          </div>
        ))}

        {/* LOW severity notice */}
        {result.siemRule.severity === 'LOW' && (
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <p className="text-success font-medium text-center">
                ✓ All findings are LOW severity — no rules or playbooks needed.
                Continue monitoring your systems.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Continue to Deploy */}
        <div className="flex justify-center pt-8">
          <Button
            onClick={onDeploy}
            className="h-14 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue to Deploy
          </Button>
        </div>

      </div>
    </div>
  )
}
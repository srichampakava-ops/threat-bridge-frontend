'use client'

import { useState } from 'react'
import { Download, Zap, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AnalysisResult, DeploymentConfig } from '@/lib/types'

interface DeployPageProps {
  result: AnalysisResult
  onInject: (config: DeploymentConfig) => void
}

export function DeployPage({ result, onInject }: DeployPageProps) {
  const [config, setConfig] = useState<DeploymentConfig>({
    siemUrl: '',
    siemApiKey: '',
    soarUrl: '',
    soarApiKey: '',
  })

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const canInject = config.siemUrl && config.siemApiKey && config.soarUrl && config.soarApiKey

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Deploy Your Protection</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Download Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary mb-2">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Download Files</CardTitle>
              <CardDescription>
                Manually upload to your tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() =>
                  handleDownload(result.siemRule.code, result.siemRule.filename)
                }
              >
                <Download className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <p className="font-medium">SIEM Rule</p>
                  <p className="text-xs text-muted-foreground">
                    {result.siemRule.filename}
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() =>
                  handleDownload(result.soarPlaybook.code, result.soarPlaybook.filename)
                }
              >
                <Download className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <p className="font-medium">SOAR Playbook</p>
                  <p className="text-xs text-muted-foreground">
                    {result.soarPlaybook.filename}
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Inject Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Inject Directly</CardTitle>
              <CardDescription>
                Push automatically to your tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{result.siemRule.siem} URL</Label>
                  <Input
                    placeholder={`https://${result.siemRule.siem.toLowerCase().replace(/\s/g, '-')}.example.com`}
                    value={config.siemUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, siemUrl: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{result.siemRule.siem} API Key</Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={config.siemApiKey}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, siemApiKey: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{result.soarPlaybook.soar} URL</Label>
                  <Input
                    placeholder={`https://${result.soarPlaybook.soar.toLowerCase().replace(/\s/g, '-')}.example.com`}
                    value={config.soarUrl}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, soarUrl: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{result.soarPlaybook.soar} API Key</Label>
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={config.soarApiKey}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, soarApiKey: e.target.value }))
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <Button
                onClick={() => onInject(config)}
                disabled={!canInject}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
              >
                <Zap className="h-4 w-4 mr-2" />
                Inject Now
              </Button>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Review all code and explanations before injecting into production systems
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

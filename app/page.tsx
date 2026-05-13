'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { ProgressBar } from '@/components/progress-bar'
import { LoadingSpinner } from '@/components/loading-spinner'
import { UploadPage } from '@/components/pages/upload-page'
import { AnalysisPage } from '@/components/pages/analysis-page'
import { CorrelationPage } from '@/components/pages/correlation-page'
import { DeployPage } from '@/components/pages/deploy-page'
import { SuccessPage } from '@/components/pages/success-page'
import type { Stage, SIEMOption, SOAROption, AnalysisResult, DeploymentConfig, DeploymentResult, CorrelationResult } from '@/lib/types'

const stageOrder: Stage[] = ['upload', 'analysis', 'correlation', 'deploy', 'complete']

export default function Home() {
  const [stage, setStage] = useState<Stage>('upload')
  const [maxReachedStage, setMaxReachedStage] = useState<Stage>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [correlationResult, setCorrelationResult] = useState<CorrelationResult | null>(null)
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null)

  const updateStage = (newStage: Stage) => {
    setStage(newStage)
    const newIndex = stageOrder.indexOf(newStage)
    const maxIndex = stageOrder.indexOf(maxReachedStage)
    if (newIndex > maxIndex) {
      setMaxReachedStage(newStage)
    }
  }

  const handleAnalyze = async (file: File, siem: SIEMOption, soar: SOAROption) => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `http://localhost:8000/upload?siem=${siem}&soar=${soar}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      console.log('Full response:', JSON.stringify(data, null, 2))

      const findings = data.analysis?.findings || []

      if (!findings || findings.length === 0) {
        alert('No findings detected in the report. Please try again.')
        setIsLoading(false)
        return
      }

      const firstFinding = findings[0]

      const transformedResult: AnalysisResult = {
        attackDiscovery: {
          attackType: firstFinding.attack_name || '',
          targetSystem: firstFinding.attack_description || '',
          timeframe: 'See report for details',
          impact: firstFinding.severity || '',
          summary: firstFinding.explanation || '',
          evidence: Array.isArray(firstFinding.evidence_quotes)
            ? firstFinding.evidence_quotes
            : [],
        },
        mitreTechniques: findings.map((f: any) => ({
          id: f.mitre_id || '',
          name: f.mitre_name || '',
          tactic: f.mitre_tactic || '',
          severity: f.severity || 'LOW',
          explanation: f.explanation || '',
          evidence: Array.isArray(f.evidence_quotes)
            ? f.evidence_quotes
            : [],
        })),
        allFindings: findings.map((f: any) => ({
          mitre_id: f.mitre_id || '',
          attack_name: f.attack_name || '',
          severity: f.severity || 'LOW',
          evidence_quotes: Array.isArray(f.evidence_quotes)
            ? f.evidence_quotes
            : [],
          siem_rule: f.siem_rule || {},
          soar_playbook: f.soar_playbook || null,
          siem: data.siem,
          soar: data.soar,
        })),
        siemRule: {
          siem: data.siem,
          severity: firstFinding.severity || 'LOW',
          filename: `${firstFinding.mitre_id}_${data.siem}_rule.txt`,
          explanation: {
            whatItDoes: firstFinding.siem_rule?.whatItDoes || '',
            howItTriggers: firstFinding.siem_rule?.howItTriggers || '',
            whatItDetects: firstFinding.siem_rule?.whatItDetects || '',
            whyGenerated: firstFinding.siem_rule?.whyGenerated || '',
            evidence: Array.isArray(firstFinding.evidence_quotes)
              ? firstFinding.evidence_quotes[0]
              : '',
          },
          code: firstFinding.siem_rule?.code || '',
        },
        soarPlaybook: firstFinding.soar_playbook !== null &&
          firstFinding.soar_playbook !== undefined
          ? {
              soar: data.soar,
              filename: `${firstFinding.mitre_id}_${data.soar}_playbook.txt`,
              explanation: {
                whatItDoes: firstFinding.soar_playbook?.whatItDoes || '',
                steps: Array.isArray(firstFinding.soar_playbook?.steps)
                  ? firstFinding.soar_playbook.steps
                  : [],
                whyGenerated: firstFinding.soar_playbook?.whyGenerated || '',
                evidence: Array.isArray(firstFinding.evidence_quotes)
                  ? firstFinding.evidence_quotes[0]
                  : '',
              },
              code: firstFinding.soar_playbook?.code || '',
            }
          : null,
      }

      setAnalysisResult(transformedResult)

      if (data.correlation) {
        setCorrelationResult(data.correlation)
      } else {
        setCorrelationResult(null)
      }

      updateStage('analysis')

    } catch (error) {
      console.error('Analysis error:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCorrelation = () => {
    if (correlationResult) {
      updateStage('correlation')
    } else {
      updateStage('deploy')
    }
  }

  const handleDeploy = () => {
    updateStage('deploy')
  }

  // ── Real deploy ─────────────────────────────────────────────────────────────
  const handleInject = async (config: DeploymentConfig) => {
    if (!analysisResult) return

    setIsLoading(true)

    const findings = analysisResult.allFindings || []
    const siem = analysisResult.siemRule.siem
    const soar = analysisResult.soarPlaybook?.soar ?? 'Shuffle' as SOAROption

    const deployPromises = findings.map((finding) => {
      const hasPlaybook = finding.soar_playbook !== null && finding.soar_playbook !== undefined
      return fetch('http://localhost:8000/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siem,
          soar,
          siem_url: config.siemUrl,
          siem_api_key: config.siemApiKey,
          soar_url: config.soarUrl,
          soar_api_key: config.soarApiKey,
          siem_rule_code: finding.siem_rule?.code || '',
          siem_rule_filename: `${finding.mitre_id}_${siem}_rule.txt`,
          soar_playbook_code: hasPlaybook ? (finding.soar_playbook?.code || '') : '',
          soar_playbook_filename: hasPlaybook ? `${finding.mitre_id}_${soar}_playbook.txt` : '',
        }),
      }).then(r => r.json())
    })

    try {
      const results = await Promise.all(deployPromises)

      const siemResults = results.map((r, i) => ({
        id: findings[i].mitre_id,
        status: r.siem_result?.status,
        message: r.siem_result?.message || ''
      }))
      const soarResults = results.map((r, i) => ({
        id: findings[i].mitre_id,
        status: r.soar_result?.status,
        message: r.soar_result?.message || ''
      }))

      const allFailed = results.every(r => r.status === 'error')
      if (allFailed) {
        alert('All deploys failed. Please check your URLs and API keys.')
        setIsLoading(false)
        return
      }

      const summary = results.map((r, i) => {
        const siemIcon = r.siem_result?.status === 'success' ? '✅' : '❌'
        const soarIcon = r.soar_result?.status === 'success' ? '✅' : '❌'
        return `${findings[i].mitre_id}: SIEM ${siemIcon} SOAR ${soarIcon}`
      }).join('\n')

      alert(`Deploy complete:\n${summary}`)

      setDeploymentResult({
        siem,
        soar,
        techniques: analysisResult.mitreTechniques.map(t => t.id),
        timestamp: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      })

      updateStage('complete')

    } catch (error) {
      console.error('Deploy error:', error)
      alert('Deploy failed. Please check your URLs and API keys and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestart = () => {
    setStage('upload')
    setMaxReachedStage('upload')
    setAnalysisResult(null)
    setCorrelationResult(null)
    setDeploymentResult(null)
  }

  const handleStageClick = (newStage: Stage) => {
    const targetIndex = stageOrder.indexOf(newStage)
    const maxIndex = stageOrder.indexOf(maxReachedStage)
    if (targetIndex <= maxIndex) {
      setStage(newStage)
    }
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProgressBar
        currentStage={stage}
        maxReachedStage={maxReachedStage}
        onStageClick={handleStageClick}
      />

      <div className="pt-32">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {stage === 'upload' && (
              <UploadPage onAnalyze={handleAnalyze} />
            )}

            {stage === 'analysis' && analysisResult && (
              <AnalysisPage
                result={analysisResult}
                onDeploy={handleCorrelation}
              />
            )}

            {stage === 'correlation' && correlationResult && (
              <CorrelationPage
                correlation={correlationResult}
                onContinue={handleDeploy}
              />
            )}

            {stage === 'deploy' && analysisResult && (
              <DeployPage result={analysisResult} onInject={handleInject} />
            )}

            {stage === 'complete' && deploymentResult && (
              <SuccessPage result={deploymentResult} onRestart={handleRestart} />
            )}
          </>
        )}
      </div>
    </main>
  )
}
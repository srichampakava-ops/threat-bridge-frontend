export type Stage = 'upload' | 'analysis' | 'correlation' | 'deploy' | 'complete'
export type SIEMOption = 'Wazuh' | 'Splunk' | 'Microsoft Sentinel' | 'Elastic' | 'IBM QRadar'
export type SOAROption = 'Shuffle' | 'Palo Alto XSOAR' | 'Splunk SOAR' | 'Microsoft Sentinel Playbooks' | 'Tines'
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

export interface AttackDiscovery {
  attackType: string
  targetSystem: string
  timeframe: string
  impact: string
  summary?: string
  evidence: string[]
}

export interface MITRETechnique {
  id: string
  name: string
  tactic: string
  severity: Severity
  explanation: string
  evidence: string[]
}

export interface SIEMRule {
  siem: SIEMOption
  severity: Severity
  explanation: {
    whatItDoes: string
    howItTriggers: string
    whatItDetects: string
    whyGenerated: string
    evidence: string
  }
  code: string
  filename: string
}

export interface SOARPlaybook {
  soar: SOAROption
  explanation: {
    whatItDoes: string
    steps: string[]
    whyGenerated: string
    evidence: string
  }
  code: string
  filename: string
}

export interface AnalysisResult {
  attackDiscovery: AttackDiscovery
  mitreTechniques: MITRETechnique[]
  siemRule: SIEMRule
  soarPlaybook: SOARPlaybook | null
}

export interface DeploymentConfig {
  siemUrl: string
  siemApiKey: string
  soarUrl: string
  soarApiKey: string
  allFindings?: FindingRule[]
  siem?: SIEMOption
  soar?: SOAROption
}

export interface DeploymentResult {
  siem: SIEMOption
  soar: SOAROption
  techniques: string[]
  timestamp: string
}

export interface FindingRule {
  mitre_id: string
  attack_name: string
  severity: Severity
  evidence_quotes: string[]
  siem_rule: any
  soar_playbook: any
  siem: string
  soar: string
}

export interface AnalysisResult {
  attackDiscovery: AttackDiscovery
  mitreTechniques: MITRETechnique[]
  allFindings: FindingRule[]
  siemRule: SIEMRule
  soarPlaybook: SOARPlaybook | null
}
export interface AttackChainStep {
  step: number
  mitre_id: string
  attack_name: string
  tactic: string
  what_happened: string
  led_to_next: string
}

export interface TimelineEvent {
  time: string
  mitre_id: string
  event: string
}

export interface PriorityAction {
  mitre_id: string
  attack_name: string
  reason: string
}

export interface CorrelationResult {
  are_related: boolean
  confidence_percentage: number
  relationship_explanation: string
  attack_chain: AttackChainStep[]
  attacker_goal: string
  attack_pattern: string
  overall_risk_score: number
  risk_explanation: string
  timeline: TimelineEvent[]
  priority_action: PriorityAction
  recommendations: string[]
}
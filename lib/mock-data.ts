import type { AnalysisResult, SIEMOption, SOAROption } from './types'

export function generateMockAnalysis(siem: SIEMOption, soar: SOAROption): AnalysisResult {
  const siemRules: Record<SIEMOption, { code: string; filename: string }> = {
    'Wazuh': {
      code: `<group name="brute_force_detection">
  <rule id="100001" level="12">
    <if_sid>5710</if_sid>
    <match>Failed password</match>
    <description>SSH brute force attack detected</description>
    <options>alert_by_email</options>
    <group>authentication_failed,</group>
  </rule>
  
  <rule id="100002" level="14">
    <if_matched_sid>100001</if_matched_sid>
    <same_source_ip />
    <frequency>5</frequency>
    <timeframe>60</timeframe>
    <description>Multiple SSH authentication failures from same source - Possible brute force</description>
    <mitre>
      <id>T1110</id>
    </mitre>
  </rule>
</group>`,
      filename: 'brute_force_detection.xml'
    },
    'Splunk': {
      code: `index=authentication sourcetype=linux_secure
| where action="failure"
| stats count by src_ip, user, _time span=1m
| where count > 5
| eval severity="high"
| eval mitre_technique="T1110"
| table _time, src_ip, user, count, severity, mitre_technique`,
      filename: 'brute_force_detection.spl'
    },
    'Microsoft Sentinel': {
      code: `SecurityEvent
| where EventID == 4625
| summarize FailedAttempts = count() by SourceIP = IpAddress, TargetAccount = Account, bin(TimeGenerated, 1m)
| where FailedAttempts > 5
| extend MitreTechnique = "T1110"
| project TimeGenerated, SourceIP, TargetAccount, FailedAttempts, MitreTechnique`,
      filename: 'BruteForceDetection.kql'
    },
    'Elastic': {
      code: `{
  "rule": {
    "name": "SSH Brute Force Detection",
    "type": "threshold",
    "query": "event.category:authentication AND event.outcome:failure",
    "threshold": {
      "field": ["source.ip"],
      "value": 5,
      "cardinality": []
    },
    "risk_score": 73,
    "severity": "high",
    "threat": [{
      "framework": "MITRE ATT&CK",
      "technique": [{"id": "T1110", "name": "Brute Force"}]
    }]
  }
}`,
      filename: 'brute_force_detection.json'
    },
    'IBM QRadar': {
      code: `SELECT sourceip, username, COUNT(*) as attempt_count
FROM events
WHERE devicetype = 'Linux Server'
  AND eventname ILIKE '%authentication failure%'
GROUP BY sourceip, username
HAVING COUNT(*) > 5
LAST 1 MINUTES`,
      filename: 'brute_force_detection.aql'
    }
  }

  const soarPlaybooks: Record<SOAROption, { code: string; filename: string }> = {
    'Shuffle': {
      code: `{
  "name": "Brute Force Response",
  "description": "Automated response to brute force attacks",
  "triggers": [{
    "type": "SIEM_ALERT",
    "parameters": {"alert_name": "brute_force_detection"}
  }],
  "actions": [
    {
      "id": "1",
      "app_name": "Shuffle Tools",
      "action": "get_alert_details",
      "parameters": {"alert_id": "$trigger.alert_id"}
    },
    {
      "id": "2", 
      "app_name": "Active Directory",
      "action": "disable_account",
      "parameters": {"username": "$1.target_user"}
    },
    {
      "id": "3",
      "app_name": "Firewall",
      "action": "block_ip",
      "parameters": {"ip_address": "$1.source_ip", "duration": "24h"}
    },
    {
      "id": "4",
      "app_name": "Email",
      "action": "send_notification",
      "parameters": {
        "to": "security-team@company.com",
        "subject": "Brute Force Attack Blocked",
        "body": "Attack from $1.source_ip targeting $1.target_user has been mitigated"
      }
    },
    {
      "id": "5",
      "app_name": "TheHive",
      "action": "create_case",
      "parameters": {
        "title": "Brute Force Attack - $1.source_ip",
        "severity": 3,
        "tags": ["brute-force", "T1110"]
      }
    }
  ]
}`,
      filename: 'brute_force_response.json'
    },
    'Palo Alto XSOAR': {
      code: `id: brute-force-response
version: 1
name: Brute Force Response Playbook
tasks:
  "0":
    id: "0"
    taskid: start
    type: start
    nexttasks:
      '#none#': ["1"]
  "1":
    id: "1"
    taskid: get-incident-details
    type: regular
    task:
      script: '|||getIncident'
    nexttasks:
      '#none#': ["2"]
  "2":
    id: "2"
    taskid: disable-user-ad
    type: regular
    task:
      script: 'ad-disable-account'
      args:
        - username: \${incident.targetuser}
    nexttasks:
      '#none#': ["3"]
  "3":
    id: "3"
    taskid: block-ip-firewall
    type: regular
    task:
      script: 'pan-os-block-ip'
      args:
        - ip: \${incident.sourceip}
  "4":
    id: "4"
    taskid: send-notification
    type: regular
    task:
      script: 'send-mail'
      args:
        - to: security-team@company.com
        - subject: Brute Force Mitigated`,
      filename: 'brute_force_response.yml'
    },
    'Splunk SOAR': {
      code: `import phantom.rules as phantom

def brute_force_response(container):
    phantom.debug('Starting brute force response playbook')
    
    # Get source IP and username from alert
    source_ip = container.get('sourceip')
    username = container.get('targetuser')
    
    # Block IP at firewall
    phantom.act('block ip',
        parameters=[{'ip': source_ip, 'duration': '24 hours'}],
        assets=['firewall'],
        name='block_attacker_ip')
    
    # Disable user account
    phantom.act('disable user',
        parameters=[{'username': username}],
        assets=['active_directory'],
        name='disable_compromised_account')
    
    # Create ticket
    phantom.act('create ticket',
        parameters=[{
            'title': f'Brute Force Attack - {source_ip}',
            'priority': 'high',
            'description': f'Blocked brute force from {source_ip} targeting {username}'
        }],
        assets=['servicenow'],
        name='create_incident_ticket')
    
    # Send notification
    phantom.act('send email',
        parameters=[{
            'to': 'security-team@company.com',
            'subject': 'Brute Force Attack Mitigated',
            'body': f'Attack blocked: {source_ip} -> {username}'
        }],
        assets=['smtp'],
        name='notify_security_team')
    
    return`,
      filename: 'brute_force_response.py'
    },
    'Microsoft Sentinel Playbooks': {
      code: `{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {},
  "resources": [{
    "type": "Microsoft.Logic/workflows",
    "apiVersion": "2017-07-01",
    "name": "BruteForceResponse",
    "location": "[resourceGroup().location]",
    "properties": {
      "definition": {
        "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
        "triggers": {
          "Microsoft_Sentinel_incident": {
            "type": "ApiConnectionWebhook",
            "inputs": {
              "body": {"callback_url": "@listCallbackUrl()"},
              "host": {"connection": {"name": "@parameters('$connections')['azuresentinel']['connectionId']"}},
              "path": "/incident-creation"
            }
          }
        },
        "actions": {
          "Block_IP_in_Azure_Firewall": {
            "type": "ApiConnection",
            "inputs": {
              "method": "post",
              "path": "/subscriptions/@{parameters('SubscriptionId')}/resourceGroups/@{parameters('ResourceGroup')}/providers/Microsoft.Network/azureFirewalls/@{parameters('FirewallName')}/rules",
              "body": {"rule": {"sourceIp": "@triggerBody()?['properties']?['relatedEntities'][0]?['properties']?['address']"}}
            }
          },
          "Disable_User_in_Azure_AD": {
            "type": "ApiConnection",
            "inputs": {
              "method": "patch",
              "path": "/v1.0/users/@{triggerBody()?['properties']?['relatedEntities'][1]?['properties']?['accountName']}",
              "body": {"accountEnabled": false}
            }
          }
        }
      }
    }
  }]
}`,
      filename: 'brute_force_response.json'
    },
    'Tines': {
      code: `{
  "name": "Brute Force Response",
  "agents": [
    {
      "type": "Agents::WebhookAgent",
      "name": "Receive SIEM Alert",
      "options": {
        "secret": "brute_force_webhook",
        "verbs": "post"
      }
    },
    {
      "type": "Agents::HTTPRequestAgent", 
      "name": "Block IP in Firewall",
      "options": {
        "url": "https://firewall.company.com/api/block",
        "method": "post",
        "payload": {
          "ip": "<<receive_siem_alert.body.source_ip>>",
          "duration": "24h",
          "reason": "Brute force attack"
        }
      }
    },
    {
      "type": "Agents::HTTPRequestAgent",
      "name": "Disable AD Account",
      "options": {
        "url": "https://graph.microsoft.com/v1.0/users/<<receive_siem_alert.body.username>>",
        "method": "patch",
        "payload": {"accountEnabled": false}
      }
    },
    {
      "type": "Agents::EmailAgent",
      "name": "Notify Security Team",
      "options": {
        "recipients": "security-team@company.com",
        "subject": "Brute Force Attack Mitigated",
        "body": "Blocked <<receive_siem_alert.body.source_ip>> targeting <<receive_siem_alert.body.username>>"
      }
    },
    {
      "type": "Agents::HTTPRequestAgent",
      "name": "Create Jira Ticket",
      "options": {
        "url": "https://company.atlassian.net/rest/api/3/issue",
        "method": "post",
        "payload": {
          "fields": {
            "project": {"key": "SEC"},
            "summary": "Brute Force Attack - <<receive_siem_alert.body.source_ip>>",
            "issuetype": {"name": "Incident"},
            "priority": {"name": "High"}
          }
        }
      }
    }
  ]
}`,
      filename: 'brute_force_response.json'
    }
  }

  return {
    attackDiscovery: {
      attackType: 'SSH Brute Force Attack',
      targetSystem: 'Production Linux Server (192.168.1.50)',
      timeframe: 'April 15, 2024 02:15 - 02:47 UTC',
      impact: 'High - Potential credential compromise and unauthorized access',
      evidence: [
        '"Multiple failed SSH login attempts detected from IP 45.33.32.156"',
        '"Authentication failure for user admin from 45.33.32.156 port 22"',
        '"5,847 failed login attempts recorded within 32 minutes"'
      ]
    },
    mitreTechniques: [
      {
        id: 'T1110',
        name: 'Brute Force',
        tactic: 'Credential Access',
        severity: 'HIGH',
        evidence: [
          '"5,847 failed login attempts recorded within 32 minutes"',
          '"Authentication failure for user admin from 45.33.32.156"'
        ]
      },
      {
        id: 'T1110.001',
        name: 'Password Guessing',
        tactic: 'Credential Access',
        severity: 'HIGH',
        evidence: [
          '"Multiple attempts with common password variations detected"',
          '"Dictionary attack pattern identified in authentication logs"'
        ]
      },
      {
        id: 'T1078',
        name: 'Valid Accounts',
        tactic: 'Initial Access',
        severity: 'MEDIUM',
        evidence: [
          '"Targeted attempts against known administrative accounts: admin, root, administrator"'
        ]
      },
      {
        id: 'T1021.004',
        name: 'Remote Services: SSH',
        tactic: 'Lateral Movement',
        severity: 'MEDIUM',
        evidence: [
          '"Attack vector: SSH service on port 22"',
          '"External IP attempting SSH connections to internal server"'
        ]
      }
    ],
    siemRule: {
      siem,
      explanation: {
        whatItDoes: 'This rule monitors authentication events and detects when multiple failed login attempts occur from the same source IP address within a short time window.',
        howItTriggers: 'The rule triggers when 5 or more authentication failures are detected from the same source IP within a 60-second window.',
        whatItDetects: 'SSH brute force attacks, password spraying attempts, and credential stuffing attacks targeting your authentication infrastructure.',
        whyGenerated: 'Based on the SOC report analysis showing a brute force attack pattern with 5,847 failed attempts in 32 minutes.',
        evidence: '"5,847 failed login attempts recorded within 32 minutes from IP 45.33.32.156"'
      },
      ...siemRules[siem]
    },
    soarPlaybook: {
      soar,
      explanation: {
        whatItDoes: 'This playbook automatically responds to brute force attack alerts by isolating the threat, protecting the targeted account, and notifying the security team.',
        steps: [
          'Receive and parse the brute force alert from the SIEM',
          'Extract attacker IP address and targeted username',
          'Block the attacking IP address at the firewall for 24 hours',
          'Disable the targeted user account in Active Directory',
          'Send email notification to the security team',
          'Create an incident case for tracking and investigation'
        ],
        whyGenerated: 'The report shows an active brute force attack requiring immediate automated response to prevent potential account compromise.',
        evidence: '"Multiple failed SSH login attempts detected from IP 45.33.32.156 targeting admin account"'
      },
      ...soarPlaybooks[soar]
    }
  }
}

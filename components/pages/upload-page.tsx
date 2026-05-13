'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SIEMOption, SOAROption } from '@/lib/types'

const siemOptions: SIEMOption[] = [
  'Wazuh',
  'Splunk',
  'Microsoft Sentinel',
  'Elastic',
  'IBM QRadar',
]

const soarOptions: SOAROption[] = [
  'Shuffle',
  'Palo Alto XSOAR',
  'Splunk SOAR',
  'Microsoft Sentinel Playbooks',
  'Tines',
]

const particles = [
  { left: '10%', top: '20%', delay: '0s', duration: '5s' },
  { left: '25%', top: '60%', delay: '1s', duration: '6s' },
  { left: '40%', top: '10%', delay: '2s', duration: '4s' },
  { left: '55%', top: '80%', delay: '0.5s', duration: '7s' },
  { left: '70%', top: '30%', delay: '1.5s', duration: '5s' },
  { left: '85%', top: '70%', delay: '3s', duration: '6s' },
  { left: '15%', top: '45%', delay: '2.5s', duration: '4s' },
  { left: '30%', top: '90%', delay: '4s', duration: '5s' },
  { left: '50%', top: '50%', delay: '1s', duration: '7s' },
  { left: '65%', top: '15%', delay: '0s', duration: '6s' },
  { left: '80%', top: '55%', delay: '2s', duration: '4s' },
  { left: '5%', top: '75%', delay: '3.5s', duration: '5s' },
  { left: '90%', top: '25%', delay: '1.5s', duration: '6s' },
  { left: '45%', top: '35%', delay: '0.5s', duration: '7s' },
  { left: '20%', top: '85%', delay: '4s', duration: '4s' },
  { left: '75%', top: '40%', delay: '2s', duration: '5s' },
  { left: '35%', top: '65%', delay: '1s', duration: '6s' },
  { left: '60%', top: '95%', delay: '3s', duration: '4s' },
  { left: '92%', top: '10%', delay: '0s', duration: '7s' },
  { left: '8%', top: '50%', delay: '2.5s', duration: '5s' },
]

interface UploadPageProps {
  onAnalyze: (file: File, siem: SIEMOption, soar: SOAROption) => void
}

export function UploadPage({ onAnalyze }: UploadPageProps) {
  const [file, setFile] = useState<File | null>(null)
  const [siem, setSiem] = useState<SIEMOption | null>(null)
  const [soar, setSoar] = useState<SOAROption | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const isValidFileType = (file: File) => {
    return (
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.txt')
    )
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleAnalyze = () => {
    if (file && siem && soar) {
      onAnalyze(file, siem, soar)
    }
  }

  const canAnalyze = file && siem && soar

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">

      <div className="absolute inset-0 animated-grid opacity-50" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/30 animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Upload Your SOC Report
          </h2>
          <p className="text-muted-foreground">
            Analyze security reports and automatically generate detection rules
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          className={cn(
            'rounded-xl border-2 border-dashed p-12 transition-all duration-300 mb-8 cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-card/50',
            file && 'border-success bg-success/5'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {file ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <FileText className="h-8 w-8 text-success" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setFile(null)
                }}
                className="gap-2 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse • PDF, DOCX, TXT
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Your SIEM
            </label>
            <Select onValueChange={(value) => setSiem(value as SIEMOption)}>
              <SelectTrigger className="h-12 bg-card border-border">
                <SelectValue placeholder="Choose SIEM..." />
              </SelectTrigger>
              <SelectContent>
                {siemOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Select Your SOAR
            </label>
            <Select onValueChange={(value) => setSoar(value as SOAROption)}>
              <SelectTrigger className="h-12 bg-card border-border">
                <SelectValue placeholder="Choose SOAR..." />
              </SelectTrigger>
              <SelectContent>
                {soarOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
        >
          Analyze Report
        </Button>
      </div>
    </div>
  )
}
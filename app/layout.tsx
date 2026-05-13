import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
})

export const metadata: Metadata = {
  title: 'ThreatBridge - AI Powered SOC Automation',
  description: 'Upload your SOC reports and automatically generate SIEM rules and SOAR playbooks with AI-powered analysis and MITRE ATT&CK mapping.',
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}

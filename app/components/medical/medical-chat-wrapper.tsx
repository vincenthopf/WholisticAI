"use client"

import React, { useState, useEffect } from 'react'
import { ConversationTypeSelector } from './conversation-type-selector'
import { EmergencyBanner } from './emergency-banner'
import { Card } from '@/components/ui/card'
import { detectSeverity } from '@/lib/medical/prompts'
import { MEDICAL_BRANDING } from '@/lib/medical/branding'
import { Shield, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MedicalChatWrapperProps {
  children: React.ReactNode
  onConversationTypeChange?: (type: string) => void
  messages?: any[]
}

export function MedicalChatWrapper({ 
  children, 
  onConversationTypeChange,
  messages = []
}: MedicalChatWrapperProps) {
  const [conversationType, setConversationType] = useState('general_consultation')
  const [currentSeverity, setCurrentSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('low')
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false)

  // Check messages for severity
  useEffect(() => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      if (lastUserMessage?.content) {
        const severity = detectSeverity(lastUserMessage.content)
        setCurrentSeverity(severity)
        setShowEmergencyBanner(severity === 'critical' || severity === 'high')
      }
    }
  }, [messages])

  const handleConversationTypeChange = (type: string) => {
    setConversationType(type)
    if (onConversationTypeChange) {
      onConversationTypeChange(type)
    }
  }

  if (!MEDICAL_BRANDING.features.medicalMode) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Emergency Banner */}
      <EmergencyBanner severity={currentSeverity} show={showEmergencyBanner} />

      {/* Medical Info Banner */}
      <Alert className="mx-4 mt-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Medical Information Only</strong> - WholisticAI provides health education, not medical advice. 
          Always consult healthcare professionals for diagnosis and treatment.
        </AlertDescription>
      </Alert>

      {/* Conversation Type Selector for New Chats */}
      {messages.length === 0 && (
        <div className="px-4 py-2">
          <ConversationTypeSelector
            value={conversationType}
            onChange={handleConversationTypeChange}
            showDescriptions={false}
          />
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* Medical Context Indicator */}
      {conversationType !== 'general_consultation' && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-3 w-3" />
            <span>Conversation mode: {conversationType.replace('_', ' ')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
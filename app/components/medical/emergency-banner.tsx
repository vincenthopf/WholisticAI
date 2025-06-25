"use client"

import React from 'react'
import { AlertTriangle, Phone, Heart } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface EmergencyBannerProps {
  severity?: 'critical' | 'high' | 'medium' | 'low'
  show?: boolean
}

export function EmergencyBanner({ severity = 'low', show = false }: EmergencyBannerProps) {
  if (!show || severity === 'low') return null

  const emergencyNumbers = {
    us: '911',
    uk: '999',
    eu: '112',
    aus: '000'
  }

  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getSeverityIcon = () => {
    switch (severity) {
      case 'critical':
        return <Phone className="h-5 w-5 text-red-500 animate-pulse" />
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Heart className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <Alert className={`mb-4 ${getSeverityStyles()}`}>
      <div className="flex items-start gap-3">
        {getSeverityIcon()}
        <div className="flex-1">
          <AlertTitle className="mb-2">
            {severity === 'critical' ? 'Medical Emergency Detected' : 'Important Health Notice'}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            {severity === 'critical' && (
              <>
                <p className="font-semibold">
                  If you're experiencing a medical emergency, please call emergency services immediately:
                </p>
                <div className="flex gap-4 my-3">
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={() => window.location.href = `tel:${emergencyNumbers.us}`}
                    className="font-bold"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call 911 (US)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const numbers = Object.entries(emergencyNumbers)
                        .map(([country, number]) => `${country.toUpperCase()}: ${number}`)
                        .join('\n')
                      alert(`Emergency Numbers:\n${numbers}`)
                    }}
                  >
                    Other Countries
                  </Button>
                </div>
                <p className="text-sm">
                  This AI cannot provide emergency medical care. Please seek immediate professional help.
                </p>
              </>
            )}
            
            {severity === 'high' && (
              <p>
                Your symptoms may require prompt medical attention. 
                Consider contacting your healthcare provider or visiting urgent care.
              </p>
            )}
            
            {severity === 'medium' && (
              <p>
                Based on your description, it would be advisable to consult with a healthcare 
                professional for proper evaluation and guidance.
              </p>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Crisis hotline numbers component
 */
export function CrisisHotlines() {
  const hotlines = [
    { name: 'National Suicide Prevention Lifeline', number: '988', country: 'US' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', country: 'US' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', country: 'US' },
    { name: 'Poison Control', number: '1-800-222-1222', country: 'US' }
  ]

  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
      <Heart className="h-4 w-4" />
      <AlertTitle>Crisis Support Resources</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-1">
          {hotlines.map((hotline) => (
            <div key={hotline.number} className="text-sm">
              <span className="font-medium">{hotline.name}:</span>{' '}
              <a 
                href={hotline.number.startsWith('Text') ? '#' : `tel:${hotline.number}`}
                className="text-blue-600 hover:underline"
              >
                {hotline.number}
              </a>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}
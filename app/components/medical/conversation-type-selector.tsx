"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  Stethoscope, 
  Pill, 
  Brain, 
  Baby, 
  Heart, 
  MessageCircle,
  AlertTriangle
} from 'lucide-react'

export interface ConversationType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const CONVERSATION_TYPES: ConversationType[] = [
  {
    id: 'general_consultation',
    name: 'General Health Question',
    description: 'Ask about general health topics, wellness, or get health information',
    icon: <Stethoscope className="h-5 w-5" />,
    severity: 'low'
  },
  {
    id: 'symptom_check',
    name: 'Symptom Assessment',
    description: 'Describe symptoms you\'re experiencing for information and guidance',
    icon: <Heart className="h-5 w-5" />,
    severity: 'medium'
  },
  {
    id: 'medication_info',
    name: 'Medication Information',
    description: 'Learn about medications, side effects, and general drug information',
    icon: <Pill className="h-5 w-5" />,
    severity: 'medium'
  },
  {
    id: 'mental_health',
    name: 'Mental Health Support',
    description: 'Discuss mental health concerns, stress, anxiety, or emotional wellbeing',
    icon: <Brain className="h-5 w-5" />,
    severity: 'high'
  },
  {
    id: 'pediatric_consultation',
    name: 'Child Health',
    description: 'Questions about infant, child, or adolescent health',
    icon: <Baby className="h-5 w-5" />,
    severity: 'high'
  },
  {
    id: 'emergency_triage',
    name: 'Urgent Symptoms',
    description: 'Experiencing severe or concerning symptoms that may need immediate care',
    icon: <AlertTriangle className="h-5 w-5" />,
    severity: 'critical'
  }
]

interface ConversationTypeSelectorProps {
  value?: string
  onChange?: (value: string) => void
  showDescriptions?: boolean
}

export function ConversationTypeSelector({ 
  value = 'general_consultation', 
  onChange,
  showDescriptions = true 
}: ConversationTypeSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">What would you like to discuss?</CardTitle>
        <CardDescription>
          Select the type of health conversation to get the most relevant assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="grid gap-3">
            {CONVERSATION_TYPES.map((type) => (
              <div key={type.id} className="flex items-start space-x-3">
                <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                <Label 
                  htmlFor={type.id} 
                  className="flex-1 cursor-pointer space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className={`
                      ${type.severity === 'critical' ? 'text-red-500' : ''}
                      ${type.severity === 'high' ? 'text-orange-500' : ''}
                      ${type.severity === 'medium' ? 'text-yellow-600' : ''}
                      ${type.severity === 'low' ? 'text-green-600' : ''}
                    `}>
                      {type.icon}
                    </span>
                    <span className="font-medium">{type.name}</span>
                  </div>
                  {showDescriptions && (
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  )}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

export function ConversationTypeChip({ typeId }: { typeId: string }) {
  const type = CONVERSATION_TYPES.find(t => t.id === typeId) || CONVERSATION_TYPES[0]
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary">
      <span className={`
        ${type.severity === 'critical' ? 'text-red-500' : ''}
        ${type.severity === 'high' ? 'text-orange-500' : ''}
        ${type.severity === 'medium' ? 'text-yellow-600' : ''}
        ${type.severity === 'low' ? 'text-green-600' : ''}
      `}>
        {type.icon}
      </span>
      <span>{type.name}</span>
    </div>
  )
}
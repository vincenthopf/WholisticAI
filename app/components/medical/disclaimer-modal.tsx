"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, Heart, Shield, Phone } from 'lucide-react'
import { useUser } from '@/lib/user-store/provider'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const DISCLAIMER_VERSION = '1.0';

export function MedicalDisclaimerModal() {
  const [open, setOpen] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useUser()
  const supabase = createClient()

  useEffect(() => {
    checkDisclaimerStatus()
  }, [user])

  const checkDisclaimerStatus = async () => {
    if (!user?.id || !supabase) return

    try {
      // Type assertion to bypass TypeScript check for missing table
      const { data, error } = await (supabase as any)
        .from('medical_disclaimers')
        .select('*')
        .eq('user_id', user.id)
        .eq('disclaimer_version', DISCLAIMER_VERSION)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No disclaimer found, show modal
          setOpen(true)
        } else if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          // Table doesn't exist - migration needs to be run
          console.warn('Medical disclaimers table not found. Please run the database migrations.')
          // Don't show modal if table doesn't exist
          return
        } else {
          console.error('Error checking disclaimer:', error)
        }
      } else if (!data) {
        setOpen(true)
      }
    } catch (error) {
      console.error('Error checking disclaimer status:', error)
    }
  }

  const acceptDisclaimer = async () => {
    if (!acknowledged || !user?.id || !supabase) return

    setLoading(true)
    try {
      // Type assertion to bypass TypeScript check for missing table
      const { error } = await (supabase as any)
        .from('medical_disclaimers')
        .insert({
          user_id: user.id,
          disclaimer_version: DISCLAIMER_VERSION
          // ip_address is optional - would need server-side handling for real IP
        })

      if (error) {
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.error('Medical disclaimers table not found. Please run the database migrations.')
          toast.error('Database configuration error. Please contact support.')
          return
        }
        throw error
      }

      // Set cookie for quick checks
      document.cookie = `medical-disclaimer-accepted=true; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year

      toast.success('Medical disclaimer accepted')
      setOpen(false)
    } catch (error) {
      console.error('Error accepting disclaimer:', error)
      toast.error('Failed to save disclaimer acceptance')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            <DialogTitle className="text-xl">Medical Information Disclaimer</DialogTitle>
          </div>
          <DialogDescription>
            Please read and acknowledge this important information before using WholisticAI
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Not Medical Advice</h3>
                <p className="text-sm text-muted-foreground">
                  WholisticAI provides health information for educational purposes only. 
                  The information provided is NOT a substitute for professional medical advice, 
                  diagnosis, or treatment. Always consult qualified healthcare professionals 
                  for medical concerns.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Emergency Situations</h3>
                <p className="text-sm text-muted-foreground">
                  In case of medical emergency, immediately call emergency services (911 in the US) 
                  or go to the nearest emergency room. Do not rely on this AI for emergency medical situations.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Privacy & Security</h3>
                <p className="text-sm text-muted-foreground">
                  Your health information is sensitive. While we implement security measures, 
                  you should not share information you're not comfortable storing digitally. 
                  We use local AI models when possible to enhance privacy.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">By using WholisticAI, you acknowledge:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>This service does not create a doctor-patient relationship</li>
                <li>Information provided should not replace professional medical care</li>
                <li>You will seek immediate medical attention for emergencies</li>
                <li>The AI may make mistakes and information should be verified</li>
                <li>You are responsible for decisions about your health</li>
                <li>This service is not intended for users under 13 years old</li>
              </ul>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Limitations</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Cannot diagnose medical conditions</li>
                <li>Cannot prescribe medications</li>
                <li>Cannot order medical tests</li>
                <li>Cannot provide specific treatment plans</li>
                <li>May not have the most current medical information</li>
              </ul>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          />
          <label
            htmlFor="acknowledge"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read, understood, and agree to these terms
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false)
              // Redirect to home or show alternative content
              window.location.href = '/'
            }}
          >
            Decline
          </Button>
          <Button
            onClick={acceptDisclaimer}
            disabled={!acknowledged || loading}
          >
            {loading ? 'Accepting...' : 'Accept and Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
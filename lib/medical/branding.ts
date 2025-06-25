/**
 * Medical branding configuration for WholisticAI
 */

export const MEDICAL_BRANDING = {
  appName: 'WholisticAI',
  appTagline: 'Your Private Health Assistant',
  appDescription: 'Secure, AI-powered health information and guidance',
  
  // Version info
  version: '0.1.0',
  stage: 'Beta',
  
  // Colors (matching medical/health theme)
  colors: {
    primary: '#10b981', // Emerald green - health, wellness
    secondary: '#3b82f6', // Blue - trust, medical
    accent: '#f59e0b', // Amber - attention, warmth
    danger: '#ef4444', // Red - emergency, critical
    success: '#22c55e', // Green - positive health
    warning: '#f97316', // Orange - caution
  },
  
  // Medical-specific UI elements
  ui: {
    showEmergencyButton: true,
    showDisclaimerBanner: true,
    showHealthMetrics: false, // Stage 3
    showMedicalHistory: false, // Stage 3
    requireDisclaimer: true,
    sessionTimeout: 4 * 60 * 60 * 1000, // 4 hours in ms
  },
  
  // Feature flags
  features: {
    medicalMode: true,
    privacyLayer: false, // Stage 2
    ragSystem: false, // Stage 3
    symptomTracking: false, // Stage 4
    medicationManagement: false, // Stage 4
    healthRecords: false, // Stage 3
    emergencyContacts: true,
    auditLogging: true,
  },
  
  // Emergency configuration
  emergency: {
    numbers: {
      us: '911',
      uk: '999',
      eu: '112',
      aus: '000',
      default: '911'
    },
    keywords: [
      'chest pain', 'heart attack', 'stroke', 'can\'t breathe',
      'severe bleeding', 'unconscious', 'seizure', 'overdose',
      'suicidal', 'suicide', 'kill myself', 'emergency'
    ]
  },
  
  // Medical conversation types
  conversationTypes: {
    general_consultation: {
      label: 'General Health Question',
      icon: '🩺',
      color: 'green'
    },
    symptom_check: {
      label: 'Symptom Assessment',
      icon: '❤️',
      color: 'yellow'
    },
    medication_info: {
      label: 'Medication Information',
      icon: '💊',
      color: 'blue'
    },
    mental_health: {
      label: 'Mental Health Support',
      icon: '🧠',
      color: 'purple'
    },
    pediatric_consultation: {
      label: 'Child Health',
      icon: '👶',
      color: 'pink'
    },
    emergency_triage: {
      label: 'Urgent Symptoms',
      icon: '🚨',
      color: 'red'
    }
  },
  
  // Legal and compliance
  legal: {
    disclaimerVersion: '1.0',
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms',
    complianceStandards: ['HIPAA', 'GDPR'],
  },
  
  // Medical data retention
  retention: {
    conversations: 90, // days
    auditLogs: 365, // days
    healthRecords: -1, // indefinite
    anonymizedData: 730, // 2 years
  }
};

/**
 * Get app title with medical context
 */
export function getMedicalAppTitle(pageTitle?: string): string {
  const base = `${MEDICAL_BRANDING.appName} ${MEDICAL_BRANDING.stage}`;
  return pageTitle ? `${pageTitle} | ${base}` : base;
}

/**
 * Check if emergency keywords are present
 */
export function containsEmergencyKeywords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return MEDICAL_BRANDING.emergency.keywords.some(keyword => 
    lowerText.includes(keyword)
  );
}

/**
 * Get emergency number for user's location
 */
export function getEmergencyNumber(countryCode?: string): string {
  if (!countryCode) return MEDICAL_BRANDING.emergency.numbers.default;
  
  const code = countryCode.toLowerCase();
  return MEDICAL_BRANDING.emergency.numbers[code] || 
         MEDICAL_BRANDING.emergency.numbers.default;
}
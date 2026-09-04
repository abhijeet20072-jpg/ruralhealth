export type Vitals = {
  temperature?: number; // Celsius
  heartRate?: number; // bpm
  respiratoryRate?: number; // breaths per min
  spO2?: number; // percentage
  systolicBp?: number;
  diastolicBp?: number;
};

export type TriageInput = {
  vitals?: Vitals;
  symptoms: string[];
  riskFactors: string[];
};

export type TriageResult = {
  urgencyLevel: 'EMERGENCY' | 'URGENT' | 'ROUTINE';
  recommendedAction: string;
  referralNeeded: boolean;
};

const EMERGENCY_SYMPTOMS = [
  'chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding', 
  'seizures', 'paralysis', 'sudden weakness', 'blue lips'
];

const URGENT_SYMPTOMS = [
  'persistent vomiting', 'high fever', 'severe abdominal pain', 
  'dehydration', 'confusion', 'dizziness'
];

export const evaluateTriage = (input: TriageInput): TriageResult => {
  const { vitals = {}, symptoms = [] } = input;
  
  const lowerSymptoms = symptoms.map(s => s.toLowerCase());

  let isEmergency = false;
  let isUrgent = false;

  // 1. Check Emergency Indicators
  if (lowerSymptoms.some(s => EMERGENCY_SYMPTOMS.includes(s))) {
    isEmergency = true;
  }
  if (vitals.spO2 !== undefined && vitals.spO2 < 92) isEmergency = true;
  if (vitals.heartRate !== undefined && (vitals.heartRate > 120 || vitals.heartRate < 50)) isEmergency = true;
  if (vitals.respiratoryRate !== undefined && (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 10)) isEmergency = true;
  if (vitals.systolicBp !== undefined && vitals.systolicBp > 180) isEmergency = true;
  if (vitals.diastolicBp !== undefined && vitals.diastolicBp > 110) isEmergency = true;

  if (isEmergency) {
    return {
      urgencyLevel: 'EMERGENCY',
      recommendedAction: 'Immediate medical attention required. Transfer to nearest hospital or Emergency Room.',
      referralNeeded: true
    };
  }

  // 2. Check Urgent Indicators
  if (lowerSymptoms.some(s => URGENT_SYMPTOMS.includes(s))) {
    isUrgent = true;
  }
  if (vitals.temperature !== undefined && vitals.temperature > 39) isUrgent = true;
  if (vitals.systolicBp !== undefined && vitals.systolicBp > 140) isUrgent = true;
  if (vitals.diastolicBp !== undefined && vitals.diastolicBp > 90) isUrgent = true;

  if (isUrgent) {
    return {
      urgencyLevel: 'URGENT',
      recommendedAction: 'Schedule consultation within 24 hours. Monitor vitals closely.',
      referralNeeded: true
    };
  }

  // 3. Routine
  return {
    urgencyLevel: 'ROUTINE',
    recommendedAction: 'Provide standard care or home remedies as per local guidelines. Normal follow-up.',
    referralNeeded: false
  };
};

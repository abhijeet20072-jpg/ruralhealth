export type RiskInput = {
  condition: string;
  age?: number;
  comorbidities?: string[];
  recentEmergencies?: number;
  vitals?: any;
};

export const calculateRisk = (input: RiskInput): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  let score = 0;
  
  if (input.age && input.age > 65) score += 1;
  if (input.age && input.age > 80) score += 1;
  
  if (input.comorbidities) {
    score += input.comorbidities.length;
  }
  
  if (input.recentEmergencies) {
    score += input.recentEmergencies * 2;
  }
  
  if (input.condition.toLowerCase().includes('heart') || input.condition.toLowerCase().includes('cardiac')) {
    score += 2;
  }
  
  if (score >= 5) return 'CRITICAL';
  if (score >= 3) return 'HIGH';
  if (score >= 1) return 'MEDIUM';
  return 'LOW';
};

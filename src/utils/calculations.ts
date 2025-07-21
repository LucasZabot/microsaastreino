import { UserData, CalculatedData, BMIClassification, BodyFatClassification, VO2ToHRConversion } from '../types';

// Calcular idade
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Calcular IMC
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Calcular FCmáxima usando fórmula de Tanaka
export const calculateMaxHeartRate = (age: number): number => {
  return 208 - (0.7 * age);
};

// Calcular TMB (Taxa Metabólica Basal) usando fórmula de Mifflin-St Jeor
export const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female'): number => {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return gender === 'male' ? base + 5 : base - 161;
};

// Classificações de IMC
export const getBMIClassification = (bmi: number, age: number): BMIClassification => {
  if (age >= 20) {
    // Adultos
    if (bmi < 18.5) return { classification: 'Baixo peso', range: '< 18,5', color: '#3b82f6' };
    if (bmi <= 24.9) return { classification: 'Normal', range: '18,5 - 24,9', color: '#10b981' };
    if (bmi <= 29.9) return { classification: 'Sobrepeso', range: '25 - 29,9', color: '#f59e0b' };
    if (bmi <= 34.9) return { classification: 'Obesidade grau I', range: '30 - 34,9', color: '#ef4444' };
    if (bmi <= 39.9) return { classification: 'Obesidade grau II', range: '35 - 39,9', color: '#dc2626' };
    return { classification: 'Obesidade grau III', range: '≥ 40', color: '#991b1b' };
  } else {
    // Adolescentes (12-18 anos) - simplificado
    if (bmi < 18.5) return { classification: 'Baixo peso', range: '< P5', color: '#3b82f6' };
    if (bmi <= 24.9) return { classification: 'Normal', range: 'P5-P85', color: '#10b981' };
    if (bmi <= 29.9) return { classification: 'Sobrepeso', range: 'P85-P95', color: '#f59e0b' };
    return { classification: 'Obesidade', range: '≥ P95', color: '#ef4444' };
  }
};

// Classificação de percentual de gordura
export const getBodyFatClassification = (bodyFat: number, age: number, gender: 'male' | 'female'): string => {
  if (age < 20) {
    // Adolescentes
    if (gender === 'male') {
      if (bodyFat <= 12) return 'Excelente';
      if (bodyFat <= 16) return 'Bom';
      if (bodyFat <= 20) return 'Aceitável';
      return 'Acima do ideal';
    } else {
      if (bodyFat <= 20) return 'Excelente';
      if (bodyFat <= 24) return 'Bom';
      if (bodyFat <= 30) return 'Aceitável';
      return 'Acima do ideal';
    }
  } else {
    // Adultos
    if (gender === 'male') {
      if (age <= 29) {
        if (bodyFat <= 10) return 'Excelente';
        if (bodyFat <= 14) return 'Bom';
        if (bodyFat <= 20) return 'Aceitável';
        return 'Acima do ideal';
      } else {
        if (bodyFat <= 12) return 'Excelente';
        if (bodyFat <= 16) return 'Bom';
        if (bodyFat <= 21) return 'Aceitável';
        return 'Acima do ideal';
      }
    } else {
      if (age <= 29) {
        if (bodyFat <= 19) return 'Excelente';
        if (bodyFat <= 23) return 'Bom';
        if (bodyFat <= 29) return 'Aceitável';
        return 'Acima do ideal';
      } else {
        if (bodyFat <= 20) return 'Excelente';
        if (bodyFat <= 24) return 'Bom';
        if (bodyFat <= 30) return 'Aceitável';
        return 'Acima do ideal';
      }
    }
  }
};

// Prescrição invertida: converter % VO₂máx para % FCmáxima
export const convertVO2ToHR = (vo2Percentage: number): number => {
  return (vo2Percentage + 42) / 1.41;
};

// Converter % FCmáxima para % VO₂máx
export const convertHRToVO2 = (hrPercentage: number): number => {
  return (hrPercentage * 1.41) - 42;
};

// Tabela de conversão VO₂ para FC
export const vo2ToHRTable: VO2ToHRConversion[] = [
  { vo2Percentage: 50, hrPercentage: 65 },
  { vo2Percentage: 60, hrPercentage: 72 },
  { vo2Percentage: 70, hrPercentage: 79 },
  { vo2Percentage: 80, hrPercentage: 87 },
  { vo2Percentage: 90, hrPercentage: 94 },
  { vo2Percentage: 100, hrPercentage: 100 },
];

// Calcular zona de treinamento baseada no objetivo
export const getTrainingZone = (objective: string): { vo2Range: [number, number], description: string } => {
  switch (objective) {
    case 'weight_loss':
      return { vo2Range: [50, 70], description: 'Zona de queima de gordura' };
    case 'conditioning':
      return { vo2Range: [60, 80], description: 'Zona aeróbica' };
    case 'performance':
      return { vo2Range: [70, 90], description: 'Zona anaeróbica' };
    case 'hypertrophy':
      return { vo2Range: [60, 85], description: 'Zona mista' };
    default:
      return { vo2Range: [60, 80], description: 'Zona geral' };
  }
};

// Calcular todos os dados baseados nos dados do usuário
export const calculateAllData = (userData: UserData): CalculatedData => {
  const age = calculateAge(userData.birthDate);
  const bmi = calculateBMI(userData.weight, userData.height);
  const bmiClassification = getBMIClassification(bmi, age);
  const maxHeartRate = calculateMaxHeartRate(age);
  const basalMetabolicRate = calculateBMR(userData.weight, userData.height, age, userData.gender);
  
  let bodyFatClassification: string | undefined;
  if (userData.bodyFatPercentage) {
    bodyFatClassification = getBodyFatClassification(userData.bodyFatPercentage, age, userData.gender);
  }

  return {
    age,
    bmi: Math.round(bmi * 10) / 10,
    bmiClassification: bmiClassification.classification,
    maxHeartRate: Math.round(maxHeartRate),
    basalMetabolicRate: Math.round(basalMetabolicRate),
    bodyFatClassification
  };
};
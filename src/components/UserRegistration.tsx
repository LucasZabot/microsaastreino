import React, { useState, useEffect } from 'react';
import { UserData, CalculatedData } from '../types';
import { calculateAllData, getBMIClassification } from '../utils/calculations';
import './UserRegistration.css';

interface UserRegistrationProps {
  onNext: (userData: UserData, calculatedData: CalculatedData) => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ onNext }) => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    birthDate: '',
    gender: 'male',
    weight: 0,
    height: 0,
    bodyFatPercentage: undefined
  });

  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (userData.name && userData.birthDate && userData.weight > 0 && userData.height > 0) {
      const calculated = calculateAllData(userData);
      setCalculatedData(calculated);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [userData]);

  const handleInputChange = (field: keyof UserData, value: string | number) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (calculatedData) {
      onNext(userData, calculatedData);
    }
  };

  const getBMIColor = (bmi: number, age: number) => {
    return getBMIClassification(bmi, age).color;
  };

  const isFormValid = userData.name && userData.birthDate && userData.weight > 0 && userData.height > 0;

  return (
    <div className="user-registration">
      <div className="container">
        <header className="header">
          <h1>💪 FitPhysio</h1>
          <p>Prescrição de Treinos Baseada em Ciência</p>
        </header>

        <div className="form-section">
          <h2>Dados Pessoais</h2>
          
          <div className="form-group">
            <label htmlFor="name">Nome completo</label>
            <input
              type="text"
              id="name"
              value={userData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthDate">Data de nascimento</label>
              <input
                type="date"
                id="birthDate"
                value={userData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Sexo</label>
              <select
                id="gender"
                value={userData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
              >
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Peso (kg)</label>
              <input
                type="number"
                id="weight"
                value={userData.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="70"
                min="30"
                max="300"
              />
            </div>

            <div className="form-group">
              <label htmlFor="height">Altura (cm)</label>
              <input
                type="number"
                id="height"
                value={userData.height || ''}
                onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                placeholder="175"
                min="120"
                max="220"
              />
            </div>
          </div>

          <div className="form-group optional">
            <label htmlFor="bodyFat">Percentual de gordura corporal (%) - Opcional</label>
            <input
              type="number"
              id="bodyFat"
              value={userData.bodyFatPercentage || ''}
              onChange={(e) => handleInputChange('bodyFatPercentage', parseFloat(e.target.value) || undefined)}
              placeholder="15"
              min="3"
              max="50"
              step="0.1"
            />
            <small>Se você não souber, deixe em branco</small>
          </div>
        </div>

        {showResults && calculatedData && (
          <div className="results-section">
            <h2>Resultados Automáticos</h2>
            
            <div className="results-grid">
              <div className="result-card">
                <div className="result-label">Idade</div>
                <div className="result-value">{calculatedData.age} anos</div>
              </div>

              <div className="result-card">
                <div className="result-label">IMC</div>
                <div className="result-value" style={{ color: getBMIColor(calculatedData.bmi, calculatedData.age) }}>
                  {calculatedData.bmi}
                </div>
                <div className="result-classification">{calculatedData.bmiClassification}</div>
              </div>

              <div className="result-card">
                <div className="result-label">FC Máxima</div>
                <div className="result-value">{calculatedData.maxHeartRate} bpm</div>
                <div className="result-info">Fórmula de Tanaka</div>
              </div>

              <div className="result-card">
                <div className="result-label">TMB</div>
                <div className="result-value">{calculatedData.basalMetabolicRate} kcal</div>
                <div className="result-info">Taxa Metabólica Basal</div>
              </div>

              {calculatedData.bodyFatClassification && (
                <div className="result-card">
                  <div className="result-label">% Gordura</div>
                  <div className="result-value">{userData.bodyFatPercentage}%</div>
                  <div className="result-classification">{calculatedData.bodyFatClassification}</div>
                </div>
              )}
            </div>

            <div className="vo2-info">
              <h3>🧪 Prescrição Invertida</h3>
              <p>
                Nossa metodologia conecta VO₂máx e FCmáxima para prescrições precisas de treinamento,
                baseada na fórmula: <strong>%FC = (%VO₂ + 42) / 1,41</strong>
              </p>
            </div>
          </div>
        )}

        <div className="navigation">
          <button
            className="btn-primary"
            onClick={handleNext}
            disabled={!isFormValid || !calculatedData}
          >
            Seguir →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;
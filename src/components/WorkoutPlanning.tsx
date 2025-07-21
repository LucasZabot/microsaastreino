import React, { useState } from 'react';
import { UserData, CalculatedData, WorkoutPlan } from '../types';
import { getTrainingZone, convertVO2ToHR, vo2ToHRTable } from '../utils/calculations';
import './WorkoutPlanning.css';

interface WorkoutPlanningProps {
  userData: UserData;
  calculatedData: CalculatedData;
  onNext: (workoutPlan: WorkoutPlan) => void;
  onBack: () => void;
}

const WorkoutPlanning: React.FC<WorkoutPlanningProps> = ({
  userData,
  calculatedData,
  onNext,
  onBack
}) => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan>({
    objective: 'conditioning',
    experienceLevel: 'beginner',
    sessionsPerWeek: 3,
    sessionDuration: 45,
    manualDataEntry: true,
    workoutSuggestion: false
  });

  const handleInputChange = (field: keyof WorkoutPlan, value: any) => {
    setWorkoutPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    onNext(workoutPlan);
  };

  const trainingZone = getTrainingZone(workoutPlan.objective);
  const minHR = Math.round((convertVO2ToHR(trainingZone.vo2Range[0]) / 100) * calculatedData.maxHeartRate);
  const maxHR = Math.round((convertVO2ToHR(trainingZone.vo2Range[1]) / 100) * calculatedData.maxHeartRate);

  const objectiveDescriptions = {
    weight_loss: {
      title: 'Emagrecimento',
      description: 'Foco na queima de gordura através de exercícios aeróbicos de intensidade moderada',
      icon: '🔥'
    },
    conditioning: {
      title: 'Condicionamento',
      description: 'Melhoria da capacidade cardiovascular e resistência geral',
      icon: '💨'
    },
    performance: {
      title: 'Performance',
      description: 'Desenvolvimento de alta performance e capacidade anaeróbica',
      icon: '🚀'
    },
    hypertrophy: {
      title: 'Hipertrofia',
      description: 'Ganho de massa muscular combinado com condicionamento',
      icon: '💪'
    }
  };

  const experienceDescriptions = {
    beginner: {
      title: 'Iniciante',
      description: 'Menos de 6 meses de treino regular',
      sessions: '2-3x por semana'
    },
    intermediate: {
      title: 'Intermediário',
      description: '6 meses a 2 anos de treino',
      sessions: '3-4x por semana'
    },
    advanced: {
      title: 'Avançado',
      description: 'Mais de 2 anos de treino',
      sessions: '4-6x por semana'
    }
  };

  return (
    <div className="workout-planning">
      <div className="container">
        <header className="header">
          <h1>📋 Planejamento do Treino</h1>
          <p>Olá, {userData.name}! Vamos personalizar seu programa de treinamento</p>
        </header>

        <div className="planning-content">
          <div className="section">
            <h2>🎯 Objetivo Principal</h2>
            <div className="objectives-grid">
              {Object.entries(objectiveDescriptions).map(([key, obj]) => (
                <div
                  key={key}
                  className={`objective-card ${workoutPlan.objective === key ? 'selected' : ''}`}
                  onClick={() => handleInputChange('objective', key)}
                >
                  <div className="objective-icon">{obj.icon}</div>
                  <h3>{obj.title}</h3>
                  <p>{obj.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>📈 Nível de Experiência</h2>
            <div className="experience-grid">
              {Object.entries(experienceDescriptions).map(([key, exp]) => (
                <div
                  key={key}
                  className={`experience-card ${workoutPlan.experienceLevel === key ? 'selected' : ''}`}
                  onClick={() => handleInputChange('experienceLevel', key)}
                >
                  <h3>{exp.title}</h3>
                  <p>{exp.description}</p>
                  <small>Recomendado: {exp.sessions}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>📅 Frequência e Duração</h2>
            <div className="frequency-section">
              <div className="form-group">
                <label>Sessões por semana</label>
                <div className="sessions-selector">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button
                      key={num}
                      className={`session-btn ${workoutPlan.sessionsPerWeek === num ? 'selected' : ''}`}
                      onClick={() => handleInputChange('sessionsPerWeek', num)}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Duração média da sessão (minutos)</label>
                <div className="duration-selector">
                  {[30, 45, 60, 75, 90].map(duration => (
                    <button
                      key={duration}
                      className={`duration-btn ${workoutPlan.sessionDuration === duration ? 'selected' : ''}`}
                      onClick={() => handleInputChange('sessionDuration', duration)}
                    >
                      {duration}min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>⚙️ Funcionalidades</h2>
            <div className="features-section">
              <div className="feature-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={workoutPlan.manualDataEntry}
                    onChange={(e) => handleInputChange('manualDataEntry', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Inserir dados do treino manualmente
                </label>
                <small>Registre FC, duração e intensidade de cada sessão</small>
              </div>

              <div className="feature-option premium">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={workoutPlan.workoutSuggestion}
                    onChange={(e) => handleInputChange('workoutSuggestion', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Sugestão automática de treino
                  <span className="premium-badge">PREMIUM</span>
                </label>
                <small>IA gera treinos personalizados baseados na sua evolução</small>
              </div>
            </div>
          </div>

          <div className="prescription-preview">
            <h2>🧪 Sua Prescrição Invertida</h2>
            <div className="prescription-content">
              <div className="zone-info">
                <h3>{trainingZone.description}</h3>
                <div className="zone-details">
                  <div className="zone-metric">
                    <span className="label">VO₂ Target:</span>
                    <span className="value">{trainingZone.vo2Range[0]}% - {trainingZone.vo2Range[1]}%</span>
                  </div>
                  <div className="zone-metric">
                    <span className="label">FC Target:</span>
                    <span className="value">{minHR} - {maxHR} bpm</span>
                  </div>
                </div>
              </div>

              <div className="conversion-table">
                <h4>Tabela de Conversão VO₂ ↔ FC</h4>
                <div className="table-grid">
                  <div className="table-header">VO₂%</div>
                  <div className="table-header">FC%</div>
                  <div className="table-header">FC (bpm)</div>
                  {vo2ToHRTable.map((row, index) => (
                    <React.Fragment key={index}>
                      <div className="table-cell">{row.vo2Percentage}%</div>
                      <div className="table-cell">{row.hrPercentage}%</div>
                      <div className="table-cell">
                        {Math.round((row.hrPercentage / 100) * calculatedData.maxHeartRate)}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="navigation">
          <button className="btn-secondary" onClick={onBack}>
            ← Voltar
          </button>
          <button className="btn-primary" onClick={handleNext}>
            Finalizar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanning;
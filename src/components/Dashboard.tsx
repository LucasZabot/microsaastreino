import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { UserData, CalculatedData, WorkoutPlan, WorkoutSession } from '../types';
import { convertHRToVO2, getTrainingZone } from '../utils/calculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  userData: UserData;
  calculatedData: CalculatedData;
  workoutPlan: WorkoutPlan;
  onRestart: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  userData,
  calculatedData,
  workoutPlan,
  onRestart
}) => {
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: workoutPlan.sessionDuration,
    avgHeartRate: 0,
    maxHeartRate: 0,
    calories: 0,
    notes: ''
  });

  const trainingZone = getTrainingZone(workoutPlan.objective);

  // Gerar dados de exemplo se não houver sessões
  useEffect(() => {
    if (workoutSessions.length === 0) {
      generateSampleData();
    }
  }, []);

  const generateSampleData = () => {
    const sampleSessions: WorkoutSession[] = [];
    const today = new Date();
    
    for (let i = 14; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (Math.random() > 0.3) { // 70% chance de ter treino no dia
        const avgHR = Math.floor(Math.random() * 40) + 140; // 140-180 bpm
        const maxHR = avgHR + Math.floor(Math.random() * 20) + 10;
        const hrPercentage = (avgHR / calculatedData.maxHeartRate) * 100;
        const vo2Percentage = convertHRToVO2(hrPercentage);
        
        sampleSessions.push({
          id: `session-${i}`,
          date: format(date, 'yyyy-MM-dd'),
          duration: workoutPlan.sessionDuration + Math.floor(Math.random() * 20) - 10,
          avgHeartRate: avgHR,
          maxHeartRate: Math.min(maxHR, calculatedData.maxHeartRate),
          calories: Math.floor((avgHR * workoutPlan.sessionDuration * 0.8) / 10),
          vo2Percentage: Math.max(40, Math.min(100, vo2Percentage)),
          hrPercentage: Math.max(60, Math.min(100, hrPercentage))
        });
      }
    }
    
    setWorkoutSessions(sampleSessions);
  };

  const handleAddWorkout = () => {
    if (newWorkout.avgHeartRate > 0 && newWorkout.duration > 0) {
      const hrPercentage = (newWorkout.avgHeartRate / calculatedData.maxHeartRate) * 100;
      const vo2Percentage = convertHRToVO2(hrPercentage);
      
      const session: WorkoutSession = {
        id: `session-${Date.now()}`,
        date: newWorkout.date,
        duration: newWorkout.duration,
        avgHeartRate: newWorkout.avgHeartRate,
        maxHeartRate: newWorkout.maxHeartRate || newWorkout.avgHeartRate + 10,
        calories: newWorkout.calories || Math.floor((newWorkout.avgHeartRate * newWorkout.duration * 0.8) / 10),
        vo2Percentage: Math.max(40, Math.min(100, vo2Percentage)),
        hrPercentage: Math.max(60, Math.min(100, hrPercentage)),
        notes: newWorkout.notes
      };

      setWorkoutSessions(prev => [...prev, session].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      setNewWorkout({
        date: format(new Date(), 'yyyy-MM-dd'),
        duration: workoutPlan.sessionDuration,
        avgHeartRate: 0,
        maxHeartRate: 0,
        calories: 0,
        notes: ''
      });
      setShowAddWorkout(false);
    }
  };

  // Dados para gráficos
  const chartData = {
    labels: workoutSessions.slice(-7).map(session => 
      format(new Date(session.date), 'dd/MM', { locale: ptBR })
    ),
    datasets: [
      {
        label: 'FC Média (bpm)',
        data: workoutSessions.slice(-7).map(session => session.avgHeartRate),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'VO₂ (%)',
        data: workoutSessions.slice(-7).map(session => session.vo2Percentage),
        borderColor: '#764ba2',
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolução dos Últimos 7 Treinos'
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Data'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'FC (bpm)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'VO₂ (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  // Estatísticas
  const totalSessions = workoutSessions.length;
  const totalMinutes = workoutSessions.reduce((sum, session) => sum + session.duration, 0);
  const totalCalories = workoutSessions.reduce((sum, session) => sum + session.calories, 0);
  const avgHeartRate = totalSessions > 0 
    ? Math.round(workoutSessions.reduce((sum, session) => sum + session.avgHeartRate, 0) / totalSessions)
    : 0;

  // Distribuição por zona
  const zoneDistribution = {
    labels: ['Zona de Gordura', 'Zona Aeróbica', 'Zona Anaeróbica'],
    datasets: [{
      data: [
        workoutSessions.filter(s => s.vo2Percentage < 60).length,
        workoutSessions.filter(s => s.vo2Percentage >= 60 && s.vo2Percentage < 80).length,
        workoutSessions.filter(s => s.vo2Percentage >= 80).length
      ],
      backgroundColor: ['#10b981', '#667eea', '#ef4444'],
      borderWidth: 0
    }]
  };

  return (
    <div className="dashboard">
      <div className="container">
        <header className="dashboard-header">
          <div className="user-info">
            <h1>🏃‍♂️ Olá, {userData.name}!</h1>
            <p>Objetivo: {trainingZone.description}</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={onRestart}>
              ⚙️ Configurações
            </button>
          </div>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏃‍♂️</div>
            <div className="stat-content">
              <div className="stat-value">{totalSessions}</div>
              <div className="stat-label">Treinos</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-value">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
              <div className="stat-label">Tempo Total</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{totalCalories}</div>
              <div className="stat-label">Calorias</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💗</div>
            <div className="stat-content">
              <div className="stat-value">{avgHeartRate}</div>
              <div className="stat-label">FC Média</div>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="zone-chart">
            <h3>Distribuição por Zona</h3>
            <Doughnut 
              data={zoneDistribution}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>

        {workoutPlan.manualDataEntry && (
          <div className="workout-entry">
            <div className="section-header">
              <h2>📝 Registrar Treino</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowAddWorkout(!showAddWorkout)}
              >
                {showAddWorkout ? 'Cancelar' : '+ Novo Treino'}
              </button>
            </div>

            {showAddWorkout && (
              <div className="add-workout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Data</label>
                    <input
                      type="date"
                      value={newWorkout.date}
                      onChange={(e) => setNewWorkout(prev => ({...prev, date: e.target.value}))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Duração (min)</label>
                    <input
                      type="number"
                      value={newWorkout.duration}
                      onChange={(e) => setNewWorkout(prev => ({...prev, duration: parseInt(e.target.value) || 0}))}
                      min="5"
                      max="180"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>FC Média (bpm)</label>
                    <input
                      type="number"
                      value={newWorkout.avgHeartRate || ''}
                      onChange={(e) => setNewWorkout(prev => ({...prev, avgHeartRate: parseInt(e.target.value) || 0}))}
                      min="60"
                      max={calculatedData.maxHeartRate}
                      placeholder="150"
                    />
                  </div>

                  <div className="form-group">
                    <label>FC Máxima (bpm) - Opcional</label>
                    <input
                      type="number"
                      value={newWorkout.maxHeartRate || ''}
                      onChange={(e) => setNewWorkout(prev => ({...prev, maxHeartRate: parseInt(e.target.value) || 0}))}
                      min="60"
                      max={calculatedData.maxHeartRate}
                      placeholder="170"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Calorias (opcional)</label>
                  <input
                    type="number"
                    value={newWorkout.calories || ''}
                    onChange={(e) => setNewWorkout(prev => ({...prev, calories: parseInt(e.target.value) || 0}))}
                    min="0"
                    max="2000"
                    placeholder="Será calculado automaticamente"
                  />
                </div>

                <div className="form-group">
                  <label>Observações</label>
                  <textarea
                    value={newWorkout.notes}
                    onChange={(e) => setNewWorkout(prev => ({...prev, notes: e.target.value}))}
                    placeholder="Como foi o treino? Alguma observação especial?"
                    rows={3}
                  />
                </div>

                <button className="btn-primary" onClick={handleAddWorkout}>
                  Salvar Treino
                </button>
              </div>
            )}
          </div>
        )}

        <div className="recent-workouts">
          <h2>📊 Treinos Recentes</h2>
          <div className="workouts-list">
            {workoutSessions.slice(0, 5).map(session => (
              <div key={session.id} className="workout-item">
                <div className="workout-date">
                  {format(new Date(session.date), "dd 'de' MMMM", { locale: ptBR })}
                </div>
                <div className="workout-metrics">
                  <span className="metric">
                    ⏱️ {session.duration}min
                  </span>
                  <span className="metric">
                    💗 {session.avgHeartRate} bpm
                  </span>
                  <span className="metric">
                    🧪 {Math.round(session.vo2Percentage)}% VO₂
                  </span>
                  <span className="metric">
                    🔥 {session.calories} kcal
                  </span>
                </div>
                {session.notes && (
                  <div className="workout-notes">{session.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="prescription-summary">
          <h2>🧪 Sua Prescrição Atual</h2>
          <div className="prescription-info">
            <div className="prescription-item">
              <strong>Objetivo:</strong> {trainingZone.description}
            </div>
            <div className="prescription-item">
              <strong>Zona VO₂:</strong> {trainingZone.vo2Range[0]}% - {trainingZone.vo2Range[1]}%
            </div>
            <div className="prescription-item">
              <strong>Zona FC:</strong> {Math.round((trainingZone.vo2Range[0] + 42) / 1.41 / 100 * calculatedData.maxHeartRate)} - {Math.round((trainingZone.vo2Range[1] + 42) / 1.41 / 100 * calculatedData.maxHeartRate)} bpm
            </div>
            <div className="prescription-item">
              <strong>Frequência:</strong> {workoutPlan.sessionsPerWeek}x por semana
            </div>
            <div className="prescription-item">
              <strong>Duração:</strong> {workoutPlan.sessionDuration} minutos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
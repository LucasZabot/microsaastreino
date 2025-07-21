import React, { useState } from 'react';
import UserRegistration from './components/UserRegistration';
import WorkoutPlanning from './components/WorkoutPlanning';
import Dashboard from './components/Dashboard';
import { UserData, CalculatedData, WorkoutPlan } from './types';
import './App.css';

type AppStep = 'registration' | 'planning' | 'dashboard';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('registration');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);

  const handleRegistrationComplete = (user: UserData, calculated: CalculatedData) => {
    setUserData(user);
    setCalculatedData(calculated);
    setCurrentStep('planning');
  };

  const handlePlanningComplete = (plan: WorkoutPlan) => {
    setWorkoutPlan(plan);
    setCurrentStep('dashboard');
  };

  const handleBackToPlanning = () => {
    setCurrentStep('planning');
  };

  const handleRestart = () => {
    setCurrentStep('registration');
    setUserData(null);
    setCalculatedData(null);
    setWorkoutPlan(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'registration':
        return (
          <UserRegistration onNext={handleRegistrationComplete} />
        );
      
      case 'planning':
        if (!userData || !calculatedData) {
          return <UserRegistration onNext={handleRegistrationComplete} />;
        }
        return (
          <WorkoutPlanning 
            userData={userData}
            calculatedData={calculatedData}
            onNext={handlePlanningComplete}
            onBack={handleRestart}
          />
        );
      
      case 'dashboard':
        if (!userData || !calculatedData || !workoutPlan) {
          return <UserRegistration onNext={handleRegistrationComplete} />;
        }
        return (
          <Dashboard 
            userData={userData}
            calculatedData={calculatedData}
            workoutPlan={workoutPlan}
            onRestart={handleRestart}
          />
        );
      
      default:
        return <UserRegistration onNext={handleRegistrationComplete} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentStep()}
    </div>
  );
}

export default App;
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { decrementTime, completeExercise } from '../store/slices/timerSlice';
import { TimerProps } from '../types';

const Timer: React.FC<TimerProps> = ({ exercise, onComplete, onPause, onResume }) => {
  const dispatch = useDispatch();
  const { currentTime, isRunning, isResting, currentSet, totalSets } = useSelector((state: RootState) => state.timer);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch(decrementTime());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, dispatch]);

  useEffect(() => {
    if (currentTime === 0 && isRunning) {
      dispatch(completeExercise());
      onComplete();
    }
  }, [currentTime, isRunning, dispatch, onComplete]);

  useEffect(() => {
    // Pulse animation when timer is running
    if (isRunning) {
      const pulseAnimation = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulseAnimation).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isRunning, scaleAnim]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    const totalDuration = isResting ? exercise.restTime : exercise.duration;
    return ((totalDuration - currentTime) / totalDuration) * 100;
  };

  const getTimerColor = (): string => {
    if (isResting) return '#f59e0b';
    if (currentTime <= 10) return '#ef4444';
    if (currentTime <= 30) return '#f59e0b';
    return '#10b981';
  };

  return (
    <View style={styles.container}>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.setInfo}>
          {isResting ? 'Descanso' : `Série ${currentSet} de ${totalSets}`}
        </Text>
      </View>

      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.timerCircle,
            {
              borderColor: getTimerColor(),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {formatTime(currentTime)}
          </Text>
        </Animated.View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getTimerColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getProgressPercentage())}%
          </Text>
        </View>
      </View>

      <View style={styles.exerciseDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Repetições</Text>
          <Text style={styles.detailValue}>{exercise.reps}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Séries</Text>
          <Text style={styles.detailValue}>{exercise.sets}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Descanso</Text>
          <Text style={styles.detailValue}>{exercise.restTime}s</Text>
        </View>
      </View>

      {exercise.instructions && exercise.instructions.length > 0 && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instruções:</Text>
          {exercise.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionText}>
              {index + 1}. {instruction}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  setInfo: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  instructionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default Timer;
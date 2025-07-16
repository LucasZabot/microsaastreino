import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimerState, Exercise } from '../../types';

const initialState: TimerState = {
  currentTime: 0,
  isRunning: false,
  isResting: false,
  currentExercise: 0,
  currentSet: 1,
  totalSets: 1,
  exerciseName: '',
};

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isRunning = true;
    },
    pauseTimer: (state) => {
      state.isRunning = false;
    },
    resetTimer: (state) => {
      state.currentTime = 0;
      state.isRunning = false;
      state.isResting = false;
      state.currentExercise = 0;
      state.currentSet = 1;
      state.exerciseName = '';
    },
    updateTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    decrementTime: (state) => {
      if (state.currentTime > 0) {
        state.currentTime -= 1;
      }
    },
    setExercise: (state, action: PayloadAction<Exercise>) => {
      const exercise = action.payload;
      state.exerciseName = exercise.name;
      state.totalSets = exercise.sets;
      state.currentSet = 1;
      state.currentTime = exercise.duration;
      state.isResting = false;
    },
    nextSet: (state) => {
      if (state.currentSet < state.totalSets) {
        state.currentSet += 1;
        state.isResting = false;
      }
    },
    startRest: (state, action: PayloadAction<number>) => {
      state.isResting = true;
      state.currentTime = action.payload; // rest time
    },
    nextExercise: (state, action: PayloadAction<{ exercise: Exercise; exerciseIndex: number }>) => {
      const { exercise, exerciseIndex } = action.payload;
      state.currentExercise = exerciseIndex;
      state.exerciseName = exercise.name;
      state.totalSets = exercise.sets;
      state.currentSet = 1;
      state.currentTime = exercise.duration;
      state.isResting = false;
    },
    completeExercise: (state) => {
      state.isRunning = false;
      state.isResting = false;
      state.currentTime = 0;
    },
    setTimerDuration: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
  },
});

export const {
  startTimer,
  pauseTimer,
  resetTimer,
  updateTime,
  decrementTime,
  setExercise,
  nextSet,
  startRest,
  nextExercise,
  completeExercise,
  setTimerDuration,
} = timerSlice.actions;

export default timerSlice.reducer;
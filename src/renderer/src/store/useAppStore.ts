import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PostureMetrics } from '../utils/ergonomics';

interface AppState {
  baselineProfile: PostureMetrics | null;
  setBaselineProfile: (profile: PostureMetrics) => void;
  clearBaseline: () => void;
  
  sessionStats: {
    alertsToday: number;
    correctTimeMs: number;
    totalTimeMs: number;
  };
  incrementAlerts: () => void;
  addSessionTime: (isCorrect: boolean, timeMs: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      baselineProfile: null,
      setBaselineProfile: (profile) => set({ baselineProfile: profile }),
      clearBaseline: () => set({ baselineProfile: null }),
      
      sessionStats: {
        alertsToday: 0,
        correctTimeMs: 0,
        totalTimeMs: 0,
      },
      incrementAlerts: () => set((state) => ({
        sessionStats: {
          ...state.sessionStats,
          alertsToday: state.sessionStats.alertsToday + 1
        }
      })),
      addSessionTime: (isCorrect, timeMs) => set((state) => ({
        sessionStats: {
          ...state.sessionStats,
          totalTimeMs: state.sessionStats.totalTimeMs + timeMs,
          correctTimeMs: state.sessionStats.correctTimeMs + (isCorrect ? timeMs : 0)
        }
      })),
    }),
    {
      name: 'derechito-storage',
    }
  )
);

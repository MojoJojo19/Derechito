import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PostureMetrics } from '../utils/ergonomics';

export interface AppNotification {
  id: string;
  type: 'alert' | 'pause' | 'sync' | 'info';
  title: string;
  body: string;
  timestamp: number; // Date.now()
  read: boolean;
}

interface AppState {
  // User Configuration
  userProfile: { name: string; email: string };
  setUserProfile: (profile: { name: string; email: string }) => void;
  
  alertMode: 'standard' | 'rigorous';
  setAlertMode: (mode: 'standard' | 'rigorous') => void;

  baselineProfile: PostureMetrics | null;
  setBaselineProfile: (profile: PostureMetrics) => void;
  clearBaseline: () => void;
  
  sessionStats: {
    alertsToday: number;
    correctTimeMs: number;
    totalTimeMs: number;
    lastResetDate: string; // YYYY-MM-DD to auto-reset daily
  };
  incrementAlerts: () => void;
  addSessionTime: (isCorrect: boolean, timeMs: number) => void;
  resetDailyStats: () => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  clearNotifications: () => void;

  // Session tracking
  sessionStartTime: number; // Date.now() when session started
  setSessionStartTime: (t: number) => void;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userProfile: { name: 'Demo', email: 'demo@derechito.app' },
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      alertMode: 'standard',
      setAlertMode: (mode) => set({ alertMode: mode }),

      baselineProfile: null,
      setBaselineProfile: (profile) => set({ baselineProfile: profile }),
      clearBaseline: () => set({ baselineProfile: null }),
      
      sessionStats: {
        alertsToday: 0,
        correctTimeMs: 0,
        totalTimeMs: 0,
        lastResetDate: getTodayStr(),
      },
      incrementAlerts: () => {
        const state = get();
        // Auto-reset if day changed
        if (state.sessionStats.lastResetDate !== getTodayStr()) {
          set({
            sessionStats: {
              alertsToday: 1,
              correctTimeMs: 0,
              totalTimeMs: 0,
              lastResetDate: getTodayStr(),
            }
          });
        } else {
          set({
            sessionStats: {
              ...state.sessionStats,
              alertsToday: state.sessionStats.alertsToday + 1,
            }
          });
        }
      },
      addSessionTime: (isCorrect, timeMs) => {
        const state = get();
        // Auto-reset if day changed
        if (state.sessionStats.lastResetDate !== getTodayStr()) {
          set({
            sessionStats: {
              alertsToday: 0,
              correctTimeMs: isCorrect ? timeMs : 0,
              totalTimeMs: timeMs,
              lastResetDate: getTodayStr(),
            }
          });
        } else {
          set({
            sessionStats: {
              ...state.sessionStats,
              totalTimeMs: state.sessionStats.totalTimeMs + timeMs,
              correctTimeMs: state.sessionStats.correctTimeMs + (isCorrect ? timeMs : 0),
            }
          });
        }
      },
      resetDailyStats: () => set({
        sessionStats: {
          alertsToday: 0,
          correctTimeMs: 0,
          totalTimeMs: 0,
          lastResetDate: getTodayStr(),
        }
      }),

      // Notifications
      notifications: [],
      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: Date.now(),
            read: false,
          },
          ...state.notifications,
        ].slice(0, 50), // Keep max 50 notifications
      })),
      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Session tracking
      sessionStartTime: 0,
      setSessionStartTime: (t) => set({ sessionStartTime: t }),
    }),
    {
      name: 'derechito-storage',
    }
  )
);

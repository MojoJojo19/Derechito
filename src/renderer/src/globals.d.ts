export {}

declare global {
  interface Window {
    api: {
      getCpuUsage: () => Promise<number>
      getRamUsage: () => Promise<{ usedMB: number; totalMB: number; pct: number }>
      pauseMonitoring: (cb: () => void) => void
      showNotification: (title: string, body: string) => Promise<void>
      savePosturePoint: (data: any) => Promise<void>
      getHistory: (userId: string, days: number) => Promise<any[]>
      getDailyLog: (userId: string, days: number) => Promise<any[]>
      getTodayAlerts: (userId: string) => Promise<{ count: number }>
      saveAlert: (data: any) => Promise<void>
      getTodaySummary: (userId: string) => Promise<{
        pct_correct: number | null
        pct_regular: number | null
        pct_bad: number | null
        total_points: number
      }>
      getWeeklyStats: (userId: string) => Promise<{
        thisWeekAvg: number | null
        lastWeekAvg: number | null
        activeDays: number
        bestDay: string | null
        bestDayScore: number | null
        alertsThisWeek: number
        alertsLastWeek: number
      }>
      saveConfig: (key: string, value: any) => Promise<void>
      getConfig: (key: string) => Promise<any>
      syncToCloud: (userId: string) => Promise<{ synced: number; error?: any }>
      lockScreen: () => Promise<void>
      suspendPC: () => Promise<void>
    }
  }
}

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
      saveConfig: (key: string, value: any) => Promise<void>
      getConfig: (key: string) => Promise<any>
      syncToCloud: (userId: string) => Promise<{ synced: number; error?: any }>
    }
  }
}

import { ipcMain, Notification } from 'electron'
import os from 'node:os'

export function registerSystemIPC() {
  // RAM real
  ipcMain.handle('get-ram-usage', () => {
    const totalMB = Math.round(os.totalmem() / 1024 / 1024)
    const freeMB = Math.round(os.freemem() / 1024 / 1024)
    const usedMB = totalMB - freeMB
    return { usedMB, totalMB, pct: Math.round((usedMB / totalMB) * 100) }
  })

  // CPU real (simple polling)
  ipcMain.handle('get-cpu-usage', () => {
    const cpus = os.cpus()
    let idle = 0, total = 0
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        total += (cpu.times as any)[type]
      }
      idle += cpu.times.idle
    })
    return Math.round((1 - idle / total) * 100)
  })

  // Mostrar notificacion nativa de Windows/Mac
  ipcMain.on('show-notification', (_, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })
}

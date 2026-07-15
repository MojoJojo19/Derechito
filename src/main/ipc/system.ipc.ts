import { ipcMain, Notification } from 'electron'
import os from 'node:os'
import { exec } from 'node:child_process'

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
  const notify = ({ title, body }: { title: string; body: string }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body, silent: false }).show()
    }
  }

  ipcMain.on('show-notification', (_, args) => notify(args))
  ipcMain.handle('show-notification', (_, args) => notify(args))

  // Lock screen (Win+L equivalent)
  ipcMain.handle('lock-screen', () => {
    if (process.platform === 'win32') {
      exec('rundll32.exe user32.dll,LockWorkStation', (err) => {
        if (err) console.error('Failed to lock screen:', err)
      })
    } else if (process.platform === 'darwin') {
      exec('pmset displaysleepnow', (err) => {
        if (err) console.error('Failed to lock screen:', err)
      })
    } else {
      // Linux
      exec('xdg-screensaver lock', (err) => {
        if (err) {
          exec('loginctl lock-session', (err2) => {
            if (err2) console.error('Failed to lock screen:', err2)
          })
        }
      })
    }
  })

  // Suspend PC (more reliable method using powrprof.dll)
  ipcMain.handle('suspend-pc', () => {
    if (process.platform === 'win32') {
      // Use rundll32 powrprof.dll which is more reliable than PowerShell SetSuspendState
      exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0', (err) => {
        if (err) {
          console.error('Failed to suspend PC via powrprof, trying fallback:', err)
          // Fallback: lock the workstation at minimum
          exec('rundll32.exe user32.dll,LockWorkStation', (err2) => {
            if (err2) console.error('Failed to lock screen as fallback:', err2)
          })
        }
      })
    } else if (process.platform === 'darwin') {
      exec('pmset sleepnow', (err) => {
        if (err) console.error('Failed to suspend:', err)
      })
    } else {
      exec('systemctl suspend', (err) => {
        if (err) {
          // Fallback for Linux
          exec('loginctl lock-session', (err2) => {
            if (err2) console.error('Failed to suspend/lock:', err2)
          })
        }
      })
    }
  })
}

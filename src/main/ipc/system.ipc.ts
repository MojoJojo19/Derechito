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

  // Suspend PC
  ipcMain.handle('suspend-pc', () => {
    if (process.platform === 'win32') {
      exec('powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"', (err) => {
        if (err) console.error('Failed to suspend PC:', err)
      })
    } else if (process.platform === 'darwin') {
      exec('pmset sleepnow', (err) => {
        if (err) console.error('Failed to suspend:', err)
      })
    } else {
      exec('systemctl suspend', (err) => {
        if (err) console.error('Failed to suspend:', err)
      })
    }
  })
}

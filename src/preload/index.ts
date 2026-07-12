import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getCpuUsage: () => ipcRenderer.invoke('get-cpu-usage'),
  getRamUsage: () => ipcRenderer.invoke('get-ram-usage'),
  pauseMonitoring: (cb: () => void) => ipcRenderer.on('pause-monitoring', cb),
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', { title, body }),
  savePosturePoint: (data: any) => ipcRenderer.invoke('save-posture-point', data),
  getHistory: (userId: string, days: number) => ipcRenderer.invoke('get-history', { userId, days }),
  saveConfig: (key: string, value: any) => ipcRenderer.invoke('save-config', { key, value }),
  getConfig: (key: string) => ipcRenderer.invoke('get-config', key),
  syncToCloud: (userId: string) => ipcRenderer.invoke('sync-to-cloud', userId),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

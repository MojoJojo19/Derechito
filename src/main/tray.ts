import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): void {
  // En dev, resolvemos a icon.png, en prod también
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))
  
  // Create tray with a small icon
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir DERECHITO',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: 'Pausar monitoreo',
      click: () => {
        mainWindow.webContents.send('pause-monitoring')
      }
    },
    { type: 'separator' },
    {
      label: 'Salir',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('DERECHITO — Monitor Postural')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

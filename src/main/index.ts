import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron'
import path from 'path'
import { reminderManager } from './reminderManager'
import { getTrayImage } from './trayIcons'

const isDev = process.env.VITE_DEV_SERVER_URL != null

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: '健康提醒助手',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL!)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  win.on('close', (e) => {
    if (tray && !isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  return win
}

function getWindow(): BrowserWindow | null {
  if (mainWindow && !mainWindow.isDestroyed()) return mainWindow
  mainWindow = createWindow()
  return mainWindow
}

function showWindow(): void {
  const win = getWindow()
  if (win) {
    win.show()
    win.focus()
  }
}

function updateTrayIcon(): void {
  if (!tray) return
  const running = reminderManager.isRunning()
  tray.setImage(getTrayImage(running))
  tray.setToolTip(running ? '健康提醒 - 运行中' : '健康提醒 - 已暂停')
}

function updateTrayMenu(): void {
  if (!tray) return
  const running = reminderManager.isRunning()
  const contextMenu = Menu.buildFromTemplate([
    {
      label: running ? '暂停提醒' : '开始提醒',
      click: () => {
        if (running) {
          reminderManager.stop()
        } else {
          reminderManager.start()
        }
        updateTrayIcon()
      },
    },
    { type: 'separator' },
    {
      label: '设置',
      click: () => showWindow(),
    },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        reminderManager.stop()
        app.quit()
      },
    },
  ])
  tray.setContextMenu(contextMenu)
}

function createTray(): void {
  const icon = getTrayImage(reminderManager.isRunning())
  tray = new Tray(icon)
  tray.setToolTip('健康提醒助手')
  updateTrayMenu()
  updateTrayIcon()

  tray.on('click', () => {
    showWindow()
  })

  tray.on('right-click', () => {
    updateTrayMenu()
    tray!.popUpContextMenu()
  })
}

function setupIpc(): void {
  ipcMain.handle('start-reminders', () => {
    reminderManager.start()
    updateTrayIcon()
    return reminderManager.getStatus()
  })

  ipcMain.handle('stop-reminders', () => {
    reminderManager.stop()
    updateTrayIcon()
    return reminderManager.getStatus()
  })

  ipcMain.handle('get-reminder-status', () => {
    return reminderManager.getStatus()
  })
}

app.whenReady().then(() => {
  reminderManager.setOnNotificationClick(() => showWindow())

  createWindow()

  createTray()

  setupIpc()

  if (reminderManager.isRunning()) {
    reminderManager.start()
    updateTrayIcon()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    getWindow()
  } else {
    showWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

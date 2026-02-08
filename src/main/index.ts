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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL!
    let loadRetries = 0
    const maxRetries = 30

    const tryLoad = () => {
      win.loadURL(devUrl)
    }

    const onFailLoad = (
      _event: any,
      errorCode: number,
      _errorDescription: string,
      _validatedURL: string,
      isMainFrame: boolean
    ) => {
      if (!isMainFrame || errorCode === -3) return
      if (loadRetries < maxRetries) {
        loadRetries += 1
        setTimeout(tryLoad, 2000)
      }
    }

    win.webContents.on('did-fail-load', onFailLoad)
    win.webContents.once('did-finish-load', () => {
      win.webContents.removeListener('did-fail-load', onFailLoad)
    })

    // 先让窗口显示，下一帧再加载 URL，避免阻塞首帧绘制
    setImmediate(() => tryLoad())
    setTimeout(() => win.webContents.openDevTools(), 600)
  } else {
    // 生产：renderer 由 Vite 构建到 dist/renderer
    win.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
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
  const newTray = new Tray(icon)
  tray = newTray
  newTray.setToolTip('健康提醒助手')
  updateTrayMenu()
  updateTrayIcon()

  newTray.on('click', () => {
    showWindow()
  })

  newTray.on('right-click', () => {
    updateTrayMenu()
    newTray.popUpContextMenu()
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

  ipcMain.handle(
    'update-reminder-config',
    (_event: any, configs: Parameters<typeof reminderManager.setConfigs>[0]) => {
      reminderManager.setConfigs(configs)
      if (reminderManager.isRunning()) {
        reminderManager.stop()
        reminderManager.start()
        updateTrayIcon()
      }
      return reminderManager.getStatus()
    }
  )

  ipcMain.handle('mark-as-completed', (_event: any, type: string) => {
    const flowers = reminderManager.markAsCompleted(type as any)
    return { success: true, flowersToday: flowers }
  })

  ipcMain.handle('get-today-flowers', () => {
    return reminderManager.getAllTodayFlowers()
  })
}

app.whenReady().then(() => {
  reminderManager.setOnNotificationClick(() => showWindow())

  mainWindow = createWindow()

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

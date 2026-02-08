"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const reminderManager_1 = require("./reminderManager");
const trayIcons_1 = require("./trayIcons");
const isDev = process.env.VITE_DEV_SERVER_URL != null;
let mainWindow = null;
let tray = null;
let isQuitting = false;
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        title: '健康提醒助手',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    if (isDev) {
        const devUrl = process.env.VITE_DEV_SERVER_URL;
        let loadRetries = 0;
        const maxRetries = 30;
        const tryLoad = () => {
            win.loadURL(devUrl);
        };
        const onFailLoad = (_event, errorCode, _errorDescription, _validatedURL, isMainFrame) => {
            if (!isMainFrame || errorCode === -3)
                return;
            if (loadRetries < maxRetries) {
                loadRetries += 1;
                setTimeout(tryLoad, 2000);
            }
        };
        win.webContents.on('did-fail-load', onFailLoad);
        win.webContents.once('did-finish-load', () => {
            win.webContents.removeListener('did-fail-load', onFailLoad);
        });
        // 先让窗口显示，下一帧再加载 URL，避免阻塞首帧绘制
        setImmediate(() => tryLoad());
        setTimeout(() => win.webContents.openDevTools(), 600);
    }
    else {
        // 生产：renderer 由 Vite 构建到 dist/renderer
        win.loadFile(path_1.default.join(__dirname, '../../dist/renderer/index.html'));
    }
    win.on('close', (e) => {
        if (tray && !isQuitting) {
            e.preventDefault();
            win.hide();
        }
    });
    return win;
}
function getWindow() {
    if (mainWindow && !mainWindow.isDestroyed())
        return mainWindow;
    mainWindow = createWindow();
    return mainWindow;
}
function showWindow() {
    const win = getWindow();
    if (win) {
        win.show();
        win.focus();
    }
}
function updateTrayIcon() {
    if (!tray)
        return;
    const running = reminderManager_1.reminderManager.isRunning();
    tray.setImage((0, trayIcons_1.getTrayImage)(running));
    tray.setToolTip(running ? '健康提醒 - 运行中' : '健康提醒 - 已暂停');
}
function updateTrayMenu() {
    if (!tray)
        return;
    const running = reminderManager_1.reminderManager.isRunning();
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: running ? '暂停提醒' : '开始提醒',
            click: () => {
                if (running) {
                    reminderManager_1.reminderManager.stop();
                }
                else {
                    reminderManager_1.reminderManager.start();
                }
                updateTrayIcon();
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
                isQuitting = true;
                reminderManager_1.reminderManager.stop();
                electron_1.app.quit();
            },
        },
    ]);
    tray.setContextMenu(contextMenu);
}
function createTray() {
    const icon = (0, trayIcons_1.getTrayImage)(reminderManager_1.reminderManager.isRunning());
    const newTray = new electron_1.Tray(icon);
    tray = newTray;
    newTray.setToolTip('健康提醒助手');
    updateTrayMenu();
    updateTrayIcon();
    newTray.on('click', () => {
        showWindow();
    });
    newTray.on('right-click', () => {
        updateTrayMenu();
        newTray.popUpContextMenu();
    });
}
function setupIpc() {
    electron_1.ipcMain.handle('start-reminders', () => {
        reminderManager_1.reminderManager.start();
        updateTrayIcon();
        return reminderManager_1.reminderManager.getStatus();
    });
    electron_1.ipcMain.handle('stop-reminders', () => {
        reminderManager_1.reminderManager.stop();
        updateTrayIcon();
        return reminderManager_1.reminderManager.getStatus();
    });
    electron_1.ipcMain.handle('get-reminder-status', () => {
        return reminderManager_1.reminderManager.getStatus();
    });
    electron_1.ipcMain.handle('update-reminder-config', (_event, configs) => {
        reminderManager_1.reminderManager.setConfigs(configs);
        if (reminderManager_1.reminderManager.isRunning()) {
            reminderManager_1.reminderManager.stop();
            reminderManager_1.reminderManager.start();
            updateTrayIcon();
        }
        return reminderManager_1.reminderManager.getStatus();
    });
    electron_1.ipcMain.handle('mark-as-completed', (_event, type) => {
        const flowers = reminderManager_1.reminderManager.markAsCompleted(type);
        return { success: true, flowersToday: flowers };
    });
    electron_1.ipcMain.handle('get-today-flowers', () => {
        return reminderManager_1.reminderManager.getAllTodayFlowers();
    });
}
electron_1.app.whenReady().then(() => {
    reminderManager_1.reminderManager.setOnNotificationClick(() => showWindow());
    mainWindow = createWindow();
    createTray();
    setupIpc();
    if (reminderManager_1.reminderManager.isRunning()) {
        reminderManager_1.reminderManager.start();
        updateTrayIcon();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        getWindow();
    }
    else {
        showWindow();
    }
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});

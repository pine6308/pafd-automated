"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getReminderStatus: () => electron_1.ipcRenderer.invoke('get-reminder-status'),
    startReminders: () => electron_1.ipcRenderer.invoke('start-reminders'),
    stopReminders: () => electron_1.ipcRenderer.invoke('stop-reminders'),
    updateReminderConfig: (configs) => electron_1.ipcRenderer.invoke('update-reminder-config', configs),
});

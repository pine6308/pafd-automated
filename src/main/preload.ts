import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getReminderStatus: () => ipcRenderer.invoke('get-reminder-status'),
  startReminders: () => ipcRenderer.invoke('start-reminders'),
  stopReminders: () => ipcRenderer.invoke('stop-reminders'),
  updateReminderConfig: (configs: unknown[]) =>
    ipcRenderer.invoke('update-reminder-config', configs),
  markAsCompleted: (type: string) => ipcRenderer.invoke('mark-as-completed', type),
  getTodayFlowers: () => ipcRenderer.invoke('get-today-flowers'),
})

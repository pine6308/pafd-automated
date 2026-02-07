import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getReminderStatus: () => ipcRenderer.invoke('get-reminder-status'),
  startReminders: () => ipcRenderer.invoke('start-reminders'),
  stopReminders: () => ipcRenderer.invoke('stop-reminders'),
  updateReminderConfig: (configs: unknown[]) =>
    ipcRenderer.invoke('update-reminder-config', configs),
})

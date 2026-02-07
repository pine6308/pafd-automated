/// <reference types="vite/client" />

export interface ReminderConfigFromMain {
  id: string
  name: string
  icon: string
  enabled: boolean
  intervalMinutes: number
  lastTriggered?: number
}

export interface ReminderStatusFromMain {
  running: boolean
  configs: ReminderConfigFromMain[]
  completionsToday: Record<string, number>
  nextTriggerTimes: Record<string, number | null>
}

interface ElectronAPI {
  getReminderStatus: () => Promise<ReminderStatusFromMain>
  startReminders: () => Promise<ReminderStatusFromMain>
  stopReminders: () => Promise<ReminderStatusFromMain>
  updateReminderConfig: (configs: ReminderConfigFromMain[]) => Promise<ReminderStatusFromMain>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

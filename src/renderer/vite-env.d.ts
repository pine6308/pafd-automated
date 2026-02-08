/// <reference types="vite/client" />

import type { FlowersToday } from '../shared/types'

declare global {
  interface Window {
    electronAPI?: {
      getReminderStatus: () => Promise<any>
      startReminders: () => Promise<any>
      stopReminders: () => Promise<any>
      updateReminderConfig: (configs: any[]) => Promise<any>
      markAsCompleted: (type: string) => Promise<{ success: boolean; flowersToday: FlowersToday }>
      getTodayFlowers: () => Promise<FlowersToday>
    }
  }
}

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

import { create } from 'zustand'
import type { FlowersToday } from '../shared/types'

export type ReminderType = 'standup' | 'water' | 'kegel' | 'neck'

interface ReminderItem {
  enabled: boolean
  interval: number
}

interface ReminderState {
  reminders: Record<ReminderType, ReminderItem>
  isRunning: boolean
  completions: Record<ReminderType, number>
  nextTriggerTimes: Record<ReminderType, number | null>
  flowers: FlowersToday
  isLoading: boolean
  error: string | null
  fetchStatus: () => Promise<void>
  toggleReminder: (type: ReminderType) => Promise<void>
  setInterval: (type: ReminderType, minutes: number) => Promise<void>
  startReminders: () => Promise<void>
  stopReminders: () => Promise<void>
  markAsCompleted: (type: ReminderType) => Promise<void>
  fetchFlowers: () => Promise<void>
}

const defaultReminders: Record<ReminderType, ReminderItem> = {
  standup: { enabled: true, interval: 45 },
  water: { enabled: true, interval: 60 },
  kegel: { enabled: false, interval: 90 },
  neck: { enabled: true, interval: 60 },
}

const emptyCompletions: Record<ReminderType, number> = {
  standup: 0,
  water: 0,
  kegel: 0,
  neck: 0,
}

const emptyNext: Record<ReminderType, number | null> = {
  standup: null,
  water: null,
  kegel: null,
  neck: null,
}

const emptyFlowers: FlowersToday = {
  standup: 0,
  water: 0,
  kegel: 0,
  neck: 0,
}

function applyStatus(
  set: (fn: (s: ReminderState) => Partial<ReminderState>) => void,
  status: {
    running: boolean
    configs: Array<{ id: string; enabled: boolean; intervalMinutes: number }>
    completionsToday: Record<string, number>
    nextTriggerTimes: Record<string, number | null>
    flowersToday?: FlowersToday
  }
) {
  const reminders = { ...defaultReminders }
  status.configs.forEach((c) => {
    if (c.id in reminders) {
      reminders[c.id as ReminderType] = {
        enabled: c.enabled,
        interval: c.intervalMinutes,
      }
    }
  })
  const completions: Record<ReminderType, number> = { ...emptyCompletions }
  const nextTriggerTimes: Record<ReminderType, number | null> = { ...emptyNext }
  ;(['standup', 'water', 'kegel', 'neck'] as const).forEach((id) => {
    completions[id] = status.completionsToday[id] ?? 0
    nextTriggerTimes[id] = status.nextTriggerTimes[id] ?? null
  })
  const flowers: FlowersToday = status.flowersToday ?? { ...emptyFlowers }
  set(() => ({
    reminders,
    isRunning: status.running,
    completions,
    nextTriggerTimes,
    flowers,
    error: null,
  }))
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: { ...defaultReminders },
  isRunning: false,
  completions: { ...emptyCompletions },
  nextTriggerTimes: { ...emptyNext },
  flowers: { ...emptyFlowers },
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    const api = window.electronAPI
    if (!api) return
    set(() => ({ isLoading: true, error: null }))
    try {
      const status = await api.getReminderStatus()
      applyStatus(set, status)
    } catch (e) {
      set(() => ({
        error: e instanceof Error ? e.message : '获取状态失败',
      }))
    } finally {
      set(() => ({ isLoading: false }))
    }
  },

  toggleReminder: async (type: ReminderType) => {
    const api = window.electronAPI
    if (!api) return
    try {
      const res = await api.getReminderStatus()
      const configs = res.configs.map((c) =>
        c.id === type ? { ...c, enabled: !c.enabled } : c
      )
      const status = await api.updateReminderConfig(configs)
      applyStatus(set, status)
    } catch (e) {
      set(() => ({
        error: e instanceof Error ? e.message : '更新失败',
      }))
    }
  },

  setInterval: async (type: ReminderType, minutes: number) => {
    const api = window.electronAPI
    if (!api) return
    try {
      const res = await api.getReminderStatus()
      const configs = res.configs.map((c) =>
        c.id === type ? { ...c, intervalMinutes: minutes } : c
      )
      const status = await api.updateReminderConfig(configs)
      applyStatus(set, status)
    } catch (e) {
      set(() => ({
        error: e instanceof Error ? e.message : '更新间隔失败',
      }))
    }
  },

  startReminders: async () => {
    const api = window.electronAPI
    if (!api) return
    set(() => ({ isLoading: true, error: null }))
    try {
      const status = await api.startReminders()
      applyStatus(set, status)
    } catch (e) {
      set(() => ({
        error: e instanceof Error ? e.message : '启动失败',
      }))
    } finally {
      set(() => ({ isLoading: false }))
    }
  },

  stopReminders: async () => {
    const api = window.electronAPI
    if (!api) return
    set(() => ({ isLoading: true, error: null }))
    try {
      const status = await api.stopReminders()
      applyStatus(set, status)
    } catch (e) {
      set(() => ({
        error: e instanceof Error ? e.message : '暂停失败',
      }))
    } finally {
      set(() => ({ isLoading: false }))
    }
  },

  markAsCompleted: async (type: ReminderType) => {
    const api = window.electronAPI
    if (!api) return
    try {
      const result = await api.markAsCompleted(type)
      if (result.success) {
        set((state) => ({
          flowers: result.flowersToday,
        }))
      }
    } catch (e) {
      set(() => ({
        error: e instanceof Error ? e.message : '标记完成失败',
      }))
    }
  },

  fetchFlowers: async () => {
    const api = window.electronAPI
    if (!api) return
    try {
      const flowers = await api.getTodayFlowers()
      set(() => ({ flowers }))
    } catch (e) {
      console.error('Failed to fetch flowers:', e)
    }
  },
}))

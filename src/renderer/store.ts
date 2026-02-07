import { create } from 'zustand'

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
  isLoading: boolean
  error: string | null
  fetchStatus: () => Promise<void>
  toggleReminder: (type: ReminderType) => Promise<void>
  setInterval: (type: ReminderType, minutes: number) => Promise<void>
  startReminders: () => Promise<void>
  stopReminders: () => Promise<void>
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

function applyStatus(
  set: (fn: (s: ReminderState) => Partial<ReminderState>) => void,
  status: {
    running: boolean
    configs: Array<{ id: string; enabled: boolean; intervalMinutes: number }>
    completionsToday: Record<string, number>
    nextTriggerTimes: Record<string, number | null>
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
  set(() => ({
    reminders,
    isRunning: status.running,
    completions,
    nextTriggerTimes,
    error: null,
  }))
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: { ...defaultReminders },
  isRunning: false,
  completions: { ...emptyCompletions },
  nextTriggerTimes: { ...emptyNext },
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
}))

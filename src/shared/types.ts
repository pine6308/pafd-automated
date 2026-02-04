/**
 * 健康提醒 - 共享类型定义
 */

// 提醒类型
export type ReminderType = 'standup' | 'water' | 'kegel' | 'neck'

// 提醒配置
export interface ReminderConfig {
  id: ReminderType
  name: string
  icon: string
  enabled: boolean
  intervalMinutes: number
  lastTriggered?: number // 存时间戳，electron-store 不宜直接存 Date
}

// 完成记录
export interface CompletionRecord {
  type: ReminderType
  completedAt: number
}

// 提醒状态（供 IPC 返回）
export interface ReminderStatus {
  running: boolean
  configs: ReminderConfig[]
}

// 以下保留兼容
export type ActivityType = 'stand' | 'water' | 'pelvic' | 'neck'

export interface AppSettings {
  launchAtLogin: boolean
  doNotDisturbStart?: string
  doNotDisturbEnd?: string
}

/**
 * 健康提醒 - 共享类型定义
 */

export type ActivityType = 'stand' | 'water' | 'pelvic' | 'neck'

export interface ReminderConfig {
  /** 提醒间隔（分钟） */
  intervalMinutes: number
  /** 是否启用 */
  enabled: boolean
  /** 活动类型 */
  activityType: ActivityType
}

export interface AppSettings {
  /** 是否开机自启 */
  launchAtLogin: boolean
  /** 勿扰时段开始（如 "22:00"） */
  doNotDisturbStart?: string
  /** 勿扰时段结束（如 "08:00"） */
  doNotDisturbEnd?: string
}

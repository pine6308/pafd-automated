import { Notification } from 'electron'
import Store from 'electron-store'
import type {
  ReminderConfig,
  ReminderType,
  CompletionsToday,
  NextTriggerTimes,
  ReminderStatus,
} from '../shared/types'

const STORE_KEY = 'reminder-configs'
const RUNNING_KEY = 'reminder-running'
const COMPLETIONS_KEY = 'reminder-completions'

const DEFAULT_CONFIGS: ReminderConfig[] = [
  { id: 'standup', name: '站起来', icon: 'stand', enabled: true, intervalMinutes: 45 },
  { id: 'water', name: '喝水', icon: 'water', enabled: true, intervalMinutes: 60 },
  { id: 'kegel', name: '提肛', icon: 'kegel', enabled: false, intervalMinutes: 90 },
  { id: 'neck', name: '颈椎运动', icon: 'neck', enabled: true, intervalMinutes: 60 },
]

const NOTIFICATION_MESSAGES: Record<
  ReminderType,
  { title: string; body: string }
> = {
  standup: {
    title: '该站起来活动啦！',
    body: '久坐伤身，站起来走一走、伸个懒腰吧～',
  },
  water: {
    title: '记得喝水哦 💧',
    body: '多喝水，保持活力一整天！',
  },
  kegel: {
    title: '提肛运动时间',
    body: '花一分钟做几组提肛，有益健康～',
  },
  neck: {
    title: '该活动颈椎啦',
    body: '左右转头、前后点头，放松肩颈～',
  },
}

export type OnNotificationClick = () => void

const EMPTY_COMPLETIONS: CompletionsToday = {
  standup: 0,
  water: 0,
  kegel: 0,
  neck: 0,
}

export class ReminderManager {
  private store = new Store<{
    [STORE_KEY]: ReminderConfig[]
    [RUNNING_KEY]?: boolean
    [COMPLETIONS_KEY]?: Array<{ type: ReminderType; completedAt: number }>
  }>()
  private intervals: Map<ReminderType, NodeJS.Timeout> = new Map()
  private onNotificationClick: OnNotificationClick = () => {}

  getConfigs(): ReminderConfig[] {
    const saved = this.store.get(STORE_KEY)
    if (Array.isArray(saved) && saved.length > 0) {
      return saved
    }
    this.store.set(STORE_KEY, DEFAULT_CONFIGS)
    return [...DEFAULT_CONFIGS]
  }

  setConfigs(configs: ReminderConfig[]): void {
    this.store.set(STORE_KEY, configs)
  }

  setOnNotificationClick(fn: OnNotificationClick): void {
    this.onNotificationClick = fn
  }

  private showNotification(type: ReminderType): void {
    const msg = NOTIFICATION_MESSAGES[type]
    if (!msg) return
    const n = new Notification({
      title: msg.title,
      body: msg.body,
    })
    n.on('click', () => {
      this.onNotificationClick()
    })
    n.show()
  }

  private addCompletion(type: ReminderType): void {
    const list = this.store.get(COMPLETIONS_KEY, [])
    list.push({ type, completedAt: Date.now() })
    this.store.set(COMPLETIONS_KEY, list)
  }

  private trigger(type: ReminderType): void {
    const now = Date.now()
    this.showNotification(type)
    this.addCompletion(type)
    const configs = this.getConfigs().map((c) =>
      c.id === type ? { ...c, lastTriggered: now } : c
    )
    this.setConfigs(configs)
  }

  private getCompletionsToday(): CompletionsToday {
    const list = this.store.get(COMPLETIONS_KEY, []) as Array<{
      type: ReminderType
      completedAt: number
    }>
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartTs = todayStart.getTime()
    const out = { ...EMPTY_COMPLETIONS }
    list.forEach(({ type, completedAt }) => {
      if (completedAt >= todayStartTs) out[type] += 1
    })
    return out
  }

  private getNextTriggerTimes(): NextTriggerTimes {
    const configs = this.getConfigs()
    const running = this.isRunning()
    const out: NextTriggerTimes = {
      standup: null,
      water: null,
      kegel: null,
      neck: null,
    }
    if (!running) return out
    configs.forEach((c) => {
      if (!c.enabled) return
      const last = c.lastTriggered
      if (last) {
        out[c.id] = last + c.intervalMinutes * 60 * 1000
      }
    })
    return out
  }

  private schedule(config: ReminderConfig): void {
    if (!config.enabled || config.intervalMinutes <= 0) return
    const ms = config.intervalMinutes * 60 * 1000
    const run = () => this.trigger(config.id)
    const id = setInterval(run, ms) as unknown as NodeJS.Timeout
    this.intervals.set(config.id, id)
  }

  start(): void {
    this.stop()
    const configs = this.getConfigs()
    configs.forEach((c) => this.schedule(c))
    this.store.set(RUNNING_KEY, true)
  }

  stop(): void {
    this.intervals.forEach((id) => clearInterval(id))
    this.intervals.clear()
    this.store.set(RUNNING_KEY, false)
  }

  isRunning(): boolean {
    return this.store.get(RUNNING_KEY, false)
  }

  getStatus(): ReminderStatus {
    return {
      running: this.isRunning(),
      configs: this.getConfigs(),
      completionsToday: this.getCompletionsToday(),
      nextTriggerTimes: this.getNextTriggerTimes(),
    }
  }
}

export const reminderManager = new ReminderManager()

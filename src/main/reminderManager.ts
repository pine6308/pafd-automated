import { Notification } from 'electron'
import Store from 'electron-store'
import type {
  ReminderConfig,
  ReminderType,
  CompletionsToday,
  NextTriggerTimes,
  ReminderStatus,
  FlowerData,
  FlowersToday,
} from '../shared/types'

const STORE_KEY = 'reminder-configs'
const RUNNING_KEY = 'reminder-running'
const COMPLETIONS_KEY = 'reminder-completions'
const FLOWERS_KEY_PREFIX = 'flowers' // flowers:YYYY-MM-DD:type

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
  private store = new Store<Record<string, any>>()
  private intervals: Map<ReminderType, NodeJS.Timeout> = new Map()
  private onNotificationClick: OnNotificationClick = () => {}
  private midnightTimer: NodeJS.Timeout | null = null

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

  // 计算距离下一个午夜的毫秒数
  private getMillisecondsUntilMidnight(): number {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.getTime() - now.getTime()
  }

  // 清理昨天及更早的提醒记录
  private cleanOldCompletions(): void {
    const list = this.store.get(COMPLETIONS_KEY, []) as Array<{
      type: ReminderType
      completedAt: number
    }>
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayStartTs = todayStart.getTime()
    
    // 只保留今天的记录
    const todayList = list.filter(({ completedAt }) => completedAt >= todayStartTs)
    this.store.set(COMPLETIONS_KEY, todayList)
    
    console.log(`Cleaned old completions. Kept ${todayList.length} today's records.`)
  }

  // 设置午夜刷新定时器
  private setupMidnightRefresh(): void {
    // 清除现有定时器
    if (this.midnightTimer) {
      clearTimeout(this.midnightTimer)
    }

    // 计算到午夜的时间
    const msUntilMidnight = this.getMillisecondsUntilMidnight()

    // 设置定时器在午夜执行
    this.midnightTimer = setTimeout(() => {
      console.log('Midnight refresh triggered at', new Date().toISOString())
      // 清理旧数据
      this.cleanOldCompletions()
      // 午夜刷新后，重新设置下一个午夜的定时器
      this.setupMidnightRefresh()
    }, msUntilMidnight)

    console.log(
      `Midnight refresh scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`
    )
  }

  private showNotification(type: ReminderType): void {
    const msg = NOTIFICATION_MESSAGES[type]
    if (!msg) return
    
    // 获取今日小红花数量
    const flowers = this.getTodayFlowers(type)
    const bodyWithFlowers = `${msg.body}\n\n🌸 今日已获得 ${flowers} 朵小红花`
    
    const n = new Notification({
      title: msg.title,
      body: bodyWithFlowers,
      silent: false,
      urgency: 'normal',
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

  // 获取今日日期字符串 YYYY-MM-DD
  private getTodayDateString(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 获取小红花存储键
  private getFlowerKey(date: string, type: ReminderType): string {
    return `${FLOWERS_KEY_PREFIX}:${date}:${type}`
  }

  // 获取今日某类型的小红花数量
  getTodayFlowers(type: ReminderType): number {
    const today = this.getTodayDateString()
    const key = this.getFlowerKey(today, type)
    const data = this.store.get(key) as FlowerData | undefined
    return data?.count ?? 0
  }

  // 获取今日所有小红花
  getAllTodayFlowers(): FlowersToday {
    const today = this.getTodayDateString()
    const result: FlowersToday = {
      standup: 0,
      water: 0,
      kegel: 0,
      neck: 0,
    }
    ;(['standup', 'water', 'kegel', 'neck'] as const).forEach((type) => {
      const key = this.getFlowerKey(today, type)
      const data = this.store.get(key) as FlowerData | undefined
      result[type] = data?.count ?? 0
    })
    return result
  }

  // 增加小红花
  private addFlower(type: ReminderType): void {
    const today = this.getTodayDateString()
    const key = this.getFlowerKey(today, type)
    const existing = this.store.get(key) as FlowerData | undefined
    const newData: FlowerData = {
      count: (existing?.count ?? 0) + 1,
      lastUpdated: Date.now(),
    }
    this.store.set(key, newData)
  }

  // 标记已完成（用户主动完成，获得小红花）
  markAsCompleted(type: ReminderType): FlowersToday {
    this.addFlower(type)
    return this.getAllTodayFlowers()
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
    // 启动时先清理一次旧数据
    this.cleanOldCompletions()
    const configs = this.getConfigs()
    configs.forEach((c) => this.schedule(c))
    this.store.set(RUNNING_KEY, true)
    // 启动时设置午夜刷新定时器
    this.setupMidnightRefresh()
  }

  stop(): void {
    this.intervals.forEach((id) => clearInterval(id))
    this.intervals.clear()
    this.store.set(RUNNING_KEY, false)
    // 停止时清除午夜刷新定时器
    if (this.midnightTimer) {
      clearTimeout(this.midnightTimer)
      this.midnightTimer = null
    }
  }

  isRunning(): boolean {
    return this.store.get(RUNNING_KEY, false)
  }

  getStatus(): ReminderStatus & { flowersToday: FlowersToday } {
    return {
      running: this.isRunning(),
      configs: this.getConfigs(),
      completionsToday: this.getCompletionsToday(),
      nextTriggerTimes: this.getNextTriggerTimes(),
      flowersToday: this.getAllTodayFlowers(),
    }
  }
}

export const reminderManager = new ReminderManager()

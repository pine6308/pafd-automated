import { useEffect, useRef, useCallback, useState } from 'react'
import { useReminderStore, type ReminderType } from './store'
import { FlowerIcon, FlowerAnimation, FloatWindowMulti, PracticeWindow } from './components'

const REMINDER_META: Record<
  ReminderType,
  { label: string; emoji: string; min: number; max: number }
> = {
  standup: { label: '站起来活动', emoji: '🧍', min: 15, max: 120 },
  water: { label: '喝水', emoji: '💧', min: 15, max: 120 },
  kegel: { label: '提肛运动', emoji: '🌼', min: 30, max: 180 },
  neck: { label: '颈椎活动', emoji: '🦴', min: 15, max: 120 },
}

function formatNextTime(ts: number | null): string {
  if (ts == null) return '—'
  const d = new Date(ts)
  const now = Date.now()
  if (d.getTime() <= now) return '即将提醒'
  const h = d.getHours()
  const m = d.getMinutes()
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function useDebouncedInterval(type: ReminderType, storeInterval: number) {
  const [localInterval, setLocalInterval] = useState(storeInterval)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const setIntervalMinutes = useReminderStore((s) => s.setInterval)

  useEffect(() => {
    setLocalInterval(storeInterval)
  }, [storeInterval])

  const onIntervalChange = useCallback(
    (minutes: number) => {
      setLocalInterval(minutes)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIntervalMinutes(type, minutes)
        timerRef.current = null
      }, 400)
    },
    [type, setIntervalMinutes]
  )

  return { localInterval, onIntervalChange }
}

function ReminderCard({
  type,
  enabled,
  interval,
  completion,
  nextTime,
  isRunning,
  flowers,
  onToggle,
  onIntervalChange,
  onComplete,
  onStartPractice,
}: {
  type: ReminderType
  enabled: boolean
  interval: number
  completion: number
  nextTime: number | null
  isRunning: boolean
  flowers: number
  onToggle: () => void
  onIntervalChange: (min: number) => void
  onComplete: () => void
  onStartPractice?: () => void
}) {
  const meta = REMINDER_META[type]
  const [justCompleted, setJustCompleted] = useState(false)
  const statusText = !isRunning
    ? '已暂停'
    : enabled
      ? `今日已提醒 ${completion} 次 · 下次 ${formatNextTime(nextTime)}`
      : '已关闭'

  const handleComplete = () => {
    onComplete()
    setJustCompleted(true)
    setTimeout(() => setJustCompleted(false), 2000) // 2秒后恢复
  }

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-4 border border-white/60">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{meta.label}</h3>
            <p className="text-xs text-gray-500">{statusText}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 ${
            enabled ? 'bg-sky-500 border-sky-500' : 'bg-gray-200 border-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 完成情况显示 */}
      <div className="mb-3 flex items-center gap-2 py-2 px-3 bg-pink-50/80 rounded-lg">
        <FlowerIcon className="w-5 h-5" />
        <span className="text-xs text-gray-700">
          今日已完成 <span className="font-semibold text-pink-600">{flowers}</span> 次
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>间隔</span>
          <span>每 {interval} 分钟提醒一次</span>
        </div>
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={5}
          value={interval}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-sky-500"
        />
      </div>

      {/* 按钮区域 */}
      <div className="flex gap-2">
        {/* 开始跟练按钮 - 仅对提肛和颈椎显示 */}
        {(type === 'kegel' || type === 'neck') && onStartPractice && (
          <button
            onClick={onStartPractice}
            disabled={!isRunning || !enabled}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              !isRunning || !enabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-400 to-red-400 text-white hover:from-pink-500 hover:to-red-500 active:scale-95'
            }`}
          >
            开始跟练
          </button>
        )}
        
        {/* 打卡按钮 */}
        <button
          onClick={handleComplete}
          disabled={!isRunning || !enabled}
          className={`${(type === 'kegel' || type === 'neck') ? 'flex-1' : 'w-full'} py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed ${
            !isRunning || !enabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : justCompleted
                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-lg scale-105'
                : 'bg-gray-400 text-white hover:bg-gray-500 active:scale-95'
          }`}
        >
          打卡1次
        </button>
      </div>
    </div>
  )
}

function ReminderCardWithDebounce({
  type,
  interval,
  ...rest
}: {
  type: ReminderType
  enabled: boolean
  interval: number
  completion: number
  nextTime: number | null
  isRunning: boolean
  flowers: number
  onToggle: () => void
  onComplete: () => void
  onStartPractice?: () => void
}) {
  const { localInterval, onIntervalChange } = useDebouncedInterval(type, interval)
  return (
    <ReminderCard
      {...rest}
      type={type}
      interval={localInterval}
      onIntervalChange={onIntervalChange}
    />
  )
}

export default function App() {
  const {
    reminders,
    isRunning,
    completions,
    nextTriggerTimes,
    flowers,
    isLoading,
    error,
    fetchStatus,
    toggleReminder,
    startReminders,
    stopReminders,
    markAsCompleted,
    fetchFlowers,
  } = useReminderStore()

  const [showAnimation, setShowAnimation] = useState(false)
  const [showFloatWindow, setShowFloatWindow] = useState(() => {
    const saved = localStorage.getItem('floatWindow:visible')
    return saved ? JSON.parse(saved) : true
  })
  
  // 跟练窗口状态
  const [practiceWindow, setPracticeWindow] = useState<{
    isOpen: boolean
    exerciseType: 'kegel' | 'neck' | null
  }>({
    isOpen: false,
    exerciseType: null
  })

  useEffect(() => {
    fetchStatus()
    fetchFlowers()
  }, [fetchStatus, fetchFlowers])

  // 保存悬浮窗口可见性状态
  useEffect(() => {
    localStorage.setItem('floatWindow:visible', JSON.stringify(showFloatWindow))
  }, [showFloatWindow])

  // 定期刷新小红花数据
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFlowers()
    }, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [fetchFlowers])

  // 每天0点自动刷新数据
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const msUntilMidnight = tomorrow.getTime() - now.getTime()

      const timer = setTimeout(() => {
        console.log('Midnight refresh - fetching latest data')
        fetchStatus()
        fetchFlowers()
        // 递归设置下一个午夜的定时器
        checkMidnight()
      }, msUntilMidnight)

      return timer
    }

    const midnightTimer = checkMidnight()
    return () => clearTimeout(midnightTimer)
  }, [fetchStatus, fetchFlowers])

  const handleComplete = useCallback(
    async (type: ReminderType) => {
      await markAsCompleted(type)
      setShowAnimation(true)
    },
    [markAsCompleted]
  )

  const handleAnimationComplete = useCallback(() => {
    setShowAnimation(false)
  }, [])

  // 打开跟练窗口
  const openPracticeWindow = useCallback((type: 'kegel' | 'neck') => {
    setPracticeWindow({
      isOpen: true,
      exerciseType: type
    })
  }, [])

  // 关闭跟练窗口
  const closePracticeWindow = useCallback(() => {
    setPracticeWindow({
      isOpen: false,
      exerciseType: null
    })
    // 关闭后刷新数据
    fetchStatus()
    fetchFlowers()
  }, [fetchStatus, fetchFlowers])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 text-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-8 pb-12">
        {/* 顶部 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center justify-center gap-2">
            健康提醒助手 <FlowerIcon className="w-8 h-8 inline-block" />
          </h1>
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isRunning ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
              aria-hidden
            />
            <span className="text-sm font-medium text-gray-600">
              {isRunning ? '运行中' : '已暂停'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            今天的小红花，正在等你领取！
          </p>
        </header>

        {error && (
          <div className="mb-4 py-2 px-4 rounded-lg bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* 4 个提醒卡片 - 2x2 四宫格布局 */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          {(['standup', 'water', 'kegel', 'neck'] as const).map((type) => (
            <ReminderCardWithDebounce
              key={type}
              type={type}
              enabled={reminders[type].enabled}
              interval={reminders[type].interval}
              completion={completions[type]}
              nextTime={nextTriggerTimes[type]}
              isRunning={isRunning}
              flowers={flowers[type]}
              onToggle={() => toggleReminder(type)}
              onComplete={() => handleComplete(type)}
              onStartPractice={
                type === 'kegel' || type === 'neck' 
                  ? () => openPracticeWindow(type)
                  : undefined
              }
            />
          ))}
        </section>

        {/* 底部控制 */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-6 border border-white/60">
          <button
            type="button"
            onClick={isRunning ? stopReminders : startReminders}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition shadow-md disabled:opacity-60 ${
              isRunning
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:from-sky-500 hover:to-blue-600'
            }`}
          >
            {isLoading ? '处理中…' : isRunning ? '暂停全部提醒' : '开始提醒'}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200/80">
            <h4 className="text-sm font-medium text-gray-600 mb-3">今日完成统计</h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              {(['standup', 'water', 'kegel', 'neck'] as const).map((type) => (
                <div key={type} className="bg-gray-50 rounded-lg py-2 px-2">
                  <span className="text-base">{REMINDER_META[type].emoji}</span>
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{REMINDER_META[type].label}</p>
                  {/* 提醒次数 */}
                  <p className="text-xs text-gray-600 mt-1">提醒{completions[type]}次</p>
                  {/* 小红花数量 - 更大字号 */}
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <FlowerIcon className="w-5 h-5" />
                    <span className="text-base font-bold text-pink-600">{flowers[type]}</span>
                  </div>
                  <p className="text-xs text-gray-500">完成次数</p>
                </div>
              ))}
            </div>
          </div>

          {/* 悬浮窗口控制 */}
          <div className="mt-4 pt-4 border-t border-gray-200/80">
            <button
              onClick={() => setShowFloatWindow(!showFloatWindow)}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              {showFloatWindow ? '隐藏悬浮窗口' : '显示悬浮窗口'}
            </button>
          </div>
        </section>
      </div>

      {/* 小红花获得动画 */}
      <FlowerAnimation show={showAnimation} onComplete={handleAnimationComplete} />

      {/* 桌面悬浮窗口 - 多提醒同时显示 */}
      {showFloatWindow && (
        <FloatWindowMulti
          reminders={(['standup', 'water', 'kegel', 'neck'] as const).map((type) => ({
            type,
            enabled: reminders[type].enabled,
            flowers: flowers[type],
            interval: reminders[type].interval,
          }))}
          isRunning={isRunning}
          onComplete={handleComplete}
        />
      )}

      {/* 跟练窗口 */}
      {practiceWindow.isOpen && practiceWindow.exerciseType && (
        <PracticeWindow
          exerciseType={practiceWindow.exerciseType}
          onClose={closePracticeWindow}
        />
      )}
    </div>
  )
}

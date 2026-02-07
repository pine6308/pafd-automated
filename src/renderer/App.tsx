import { useEffect, useRef, useCallback, useState } from 'react'
import { useReminderStore, type ReminderType } from './store'

const REMINDER_META: Record<
  ReminderType,
  { label: string; emoji: string; min: number; max: number }
> = {
  standup: { label: '站起来活动', emoji: '🧍', min: 15, max: 120 },
  water: { label: '喝水', emoji: '💧', min: 15, max: 120 },
  kegel: { label: '提肛运动', emoji: '💪', min: 30, max: 180 },
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
  onToggle,
  onIntervalChange,
}: {
  type: ReminderType
  enabled: boolean
  interval: number
  completion: number
  nextTime: number | null
  isRunning: boolean
  onToggle: () => void
  onIntervalChange: (min: number) => void
}) {
  const meta = REMINDER_META[type]
  const statusText = !isRunning
    ? '已暂停'
    : enabled
      ? `今日已提醒 ${completion} 次 · 下次 ${formatNextTime(nextTime)}`
      : '已关闭'

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-white/60">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{meta.label}</h3>
            <p className="text-sm text-gray-500">{statusText}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={onToggle}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 ${
            enabled ? 'bg-violet-500 border-violet-500' : 'bg-gray-200 border-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
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
          className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-violet-500"
        />
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
  onToggle: () => void
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
    isLoading,
    error,
    fetchStatus,
    toggleReminder,
    startReminders,
    stopReminders,
  } = useReminderStore()

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-violet-100 text-gray-800">
      <div className="max-w-2xl mx-auto px-6 py-8 pb-12">
        {/* 顶部 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            健康提醒助手 ❤️
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
            喝水 · 站起来活动 · 提肛运动 · 颈椎活动
          </p>
        </header>

        {error && (
          <div className="mb-4 py-2 px-4 rounded-lg bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* 4 个提醒卡片 */}
        <section className="space-y-4 mb-8">
          {(['standup', 'water', 'kegel', 'neck'] as const).map((type) => (
            <ReminderCardWithDebounce
              key={type}
              type={type}
              enabled={reminders[type].enabled}
              interval={reminders[type].interval}
              completion={completions[type]}
              nextTime={nextTriggerTimes[type]}
              isRunning={isRunning}
              onToggle={() => toggleReminder(type)}
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
                : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600'
            }`}
          >
            {isLoading ? '处理中…' : isRunning ? '暂停提醒' : '开始提醒'}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200/80">
            <h4 className="text-sm font-medium text-gray-600 mb-3">今日完成统计</h4>
            <div className="grid grid-cols-4 gap-3 text-center">
              {(['standup', 'water', 'kegel', 'neck'] as const).map((type) => (
                <div key={type} className="bg-gray-50 rounded-lg py-2 px-3">
                  <span className="text-lg">{REMINDER_META[type].emoji}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{REMINDER_META[type].label}</p>
                  <p className="text-lg font-semibold text-violet-600">{completions[type]}</p>
                  <p className="text-xs text-gray-400">次</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { FlowerIcon } from './FlowerIcon'
import { ProgressBar } from './ProgressBar'
import type { ReminderType } from '../store'

interface FloatWindowProps {
  type: ReminderType
  completions: number
  flowers: number
  isRunning: boolean
  interval: number // 提醒间隔（分钟）
  onComplete: () => void
  onTypeChange?: (type: ReminderType) => void
}

const REMINDER_LABELS: Record<ReminderType, string> = {
  standup: '站起来活动',
  water: '喝水',
  kegel: '提肛运动',
  neck: '颈椎活动',
}

const REMINDER_EMOJIS: Record<ReminderType, string> = {
  standup: '🧍',
  water: '💧',
  kegel: '💪',
  neck: '🦴',
}

// 默认位置：屏幕右上角
const DEFAULT_POSITION = { x: -1, y: 50 } // x=-1 表示需要计算右侧位置

/**
 * 桌面悬浮窗口组件
 * 支持拖动、毛玻璃效果、进度显示
 */
// 计算每日最大提醒次数（基于间隔时间）
function calculateDailyMax(intervalMinutes: number): number {
  // 一天的分钟数
  const minutesPerDay = 24 * 60
  // 计算理论最大次数
  const maxTimes = Math.floor(minutesPerDay / intervalMinutes)
  // 限制在合理范围内（最少1次，最多32次）
  return Math.max(1, Math.min(maxTimes, 32))
}

export function FloatWindow({
  type,
  completions,
  flowers,
  isRunning,
  interval,
  onComplete,
  onTypeChange,
}: FloatWindowProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(DEFAULT_POSITION)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const floatWindowRef = useRef<HTMLDivElement>(null)

  // 从 localStorage 加载位置
  useEffect(() => {
    const saved = localStorage.getItem('floatWindow:position')
    if (saved) {
      try {
        const savedPos = JSON.parse(saved)
        setPosition(savedPos)
      } catch (e) {
        console.error('Failed to parse saved position:', e)
      }
    } else {
      // 计算默认右上角位置
      const defaultX = window.innerWidth - 350
      setPosition({ x: defaultX, y: 50 })
    }
  }, [])

  // 保存位置到 localStorage
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    localStorage.setItem('floatWindow:position', JSON.stringify(pos))
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 只有点击头部才能拖动
      const target = e.target as HTMLElement
      if (!target.closest('.float-window-header')) return

      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    },
    [position]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // 边界限制
      const maxX = window.innerWidth - (floatWindowRef.current?.offsetWidth || 320)
      const maxY = window.innerHeight - (floatWindowRef.current?.offsetHeight || 200)

      const boundedX = Math.max(0, Math.min(newX, maxX))
      const boundedY = Math.max(0, Math.min(newY, maxY))

      setPosition({ x: boundedX, y: boundedY })
    },
    [isDragging, dragOffset]
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      savePosition(position)
    }
  }, [isDragging, position, savePosition])

  // 监听鼠标移动和释放事件
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // 根据间隔时间计算今日最大次数
  const dailyTarget = calculateDailyMax(interval)

  return (
    <div
      ref={floatWindowRef}
      className={`float-window fixed rounded-2xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
        isDragging ? 'scale-105 shadow-3xl cursor-grabbing' : 'cursor-default'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: '300px',
        zIndex: 9999,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 头部 - 可拖动区域 */}
      <div className="float-window-header px-4 py-3 cursor-move border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onTypeChange ? (
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as ReminderType)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="text-sm font-semibold bg-transparent border-none outline-none cursor-pointer text-gray-800 dark:text-gray-200"
            >
              {(['standup', 'water', 'kegel', 'neck'] as const).map((t) => (
                <option key={t} value={t}>
                  {REMINDER_EMOJIS[t]} {REMINDER_LABELS[t]}
                </option>
              ))}
            </select>
          ) : (
            <>
              <span className="text-xl">{REMINDER_EMOJIS[type]}</span>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {REMINDER_LABELS[type]}
              </h3>
            </>
          )}
        </div>
        <div
          className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-gray-400'}`}
        />
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-4">
        {/* 进度条 - 基于完成次数而非提醒次数 */}
        <div>
          <ProgressBar completed={flowers} total={dailyTarget} />
        </div>

        {/* 小红花显示 */}
        <div className="flex items-center gap-2 py-2 px-3 bg-pink-50/50 dark:bg-pink-900/20 rounded-lg">
          <FlowerIcon className="w-5 h-5 flower-float" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            今日已完成 <span className="text-pink-600 dark:text-pink-400">{flowers}</span> 次
          </span>
        </div>
        
        {/* 提醒次数显示 */}
        <div className="text-xs text-gray-500 text-center">
          系统已提醒 {completions} 次
        </div>

        {/* 标记已完成按钮 */}
        <button
          onClick={onComplete}
          className="w-full py-3 px-4 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isRunning}
        >
          标记完成1次
        </button>
      </div>
    </div>
  )
}

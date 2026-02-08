import { useState, useEffect, useCallback, useRef } from 'react'
import { FlowerIcon } from './FlowerIcon'
import type { ReminderType } from '../store'

interface ReminderData {
  type: ReminderType
  enabled: boolean
  flowers: number
  interval: number
}

interface FloatWindowMultiProps {
  reminders: ReminderData[]
  isRunning: boolean
  onComplete: (type: ReminderType) => void
}

const REMINDER_INFO: Record<
  ReminderType,
  { label: string; emoji: string; message: string }
> = {
  standup: {
    label: '站起来活动',
    emoji: '🧍',
    message: '坐太久啦，起来走两步~',
  },
  water: {
    label: '喝水',
    emoji: '💧',
    message: '该喝水啦，身体正在等你滋润它',
  },
  kegel: {
    label: '提肛运动',
    emoji: '🌼',
    message: '悄悄做，默默强，提肛打卡领红花',
  },
  neck: {
    label: '颈椎活动',
    emoji: '🦴',
    message: '脖子僵了吗？转一转，松一松',
  },
}

// 默认位置：屏幕右上角
const DEFAULT_POSITION = { x: -1, y: 50 }

/**
 * 多提醒悬浮窗口组件
 * 同时显示所有开启的提醒，紧凑布局
 */
export function FloatWindowMulti({
  reminders,
  isRunning,
  onComplete,
}: FloatWindowMultiProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>(DEFAULT_POSITION)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const floatWindowRef = useRef<HTMLDivElement>(null)

  // 只显示已开启的提醒
  const enabledReminders = reminders.filter((r) => r.enabled)

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
      const defaultX = window.innerWidth - 350
      setPosition({ x: defaultX, y: 50 })
    }
  }, [])

  // 保存位置
  const savePosition = useCallback((pos: { x: number; y: number }) => {
    localStorage.setItem('floatWindow:position', JSON.stringify(pos))
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
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

  if (enabledReminders.length === 0) {
    return null
  }

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
      {/* 头部 */}
      <div className="float-window-header px-4 py-3 cursor-move border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlowerIcon className="w-6 h-6" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            完成领取小红花
          </h3>
        </div>
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      </div>

      {/* 内容区域 - 所有提醒列表 */}
      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {enabledReminders.map((reminder) => {
          const info = REMINDER_INFO[reminder.type]
          return (
            <div
              key={reminder.type}
              className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-2.5 border border-sky-200/50"
            >
              {/* 一行布局：图标、名称、小红花、按钮 */}
              <div className="flex items-center justify-between gap-2">
                {/* 左侧：图标和名称 */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-base">{info.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                    {info.label}
                  </span>
                </div>

                {/* 右侧：小红花和按钮 */}
                <div className="flex items-center gap-2">
                  {/* 小红花数量 */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <FlowerIcon className="w-4 h-4" />
                    <span className="text-sm font-bold text-pink-600 dark:text-pink-400 min-w-[1rem] text-center">
                      {reminder.flowers}
                    </span>
                  </div>

                  {/* 打卡按钮 */}
                  <button
                    onClick={() => onComplete(reminder.type)}
                    disabled={!isRunning}
                    className="py-1.5 px-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg font-semibold text-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    打卡
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 底部提示 */}
      {!isRunning && (
        <div className="px-4 py-2 text-xs text-center text-gray-500 border-t border-gray-200/30">
          提醒已暂停
        </div>
      )}
    </div>
  )
}

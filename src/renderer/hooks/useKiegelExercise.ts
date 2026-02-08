/**
 * 提肛运动控制逻辑 Hook
 */

import { useState, useEffect, useRef } from 'react'

interface UseKiegelExerciseReturn {
  phase: 'contract' | 'hold' | 'relax'
  currentSet: number
  totalSets: number
  countdown: number
  scale: number
  isPaused: boolean
  isCompleted: boolean
  progress: number
  togglePause: () => void
  skipSet: () => void
}

const PHASE_DURATIONS = {
  contract: 5,  // 收缩5秒
  hold: 5,      // 保持5秒
  relax: 10     // 放松10秒
}

export function useKiegelExercise(
  totalSets: number = 10,
  onComplete?: () => void
): UseKiegelExerciseReturn {
  const [phase, setPhase] = useState<'contract' | 'hold' | 'relax'>('contract')
  const [currentSet, setCurrentSet] = useState(1)
  const [countdown, setCountdown] = useState(PHASE_DURATIONS.contract)
  const [scale, setScale] = useState(1.0)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseStartTimeRef = useRef(Date.now())
  const pausedCountdownRef = useRef(countdown)

  // 计算总进度
  const progress = ((currentSet - 1) * 3 + 
    (phase === 'contract' ? 0 : phase === 'hold' ? 1 : 2)) / (totalSets * 3)

  // 移动到下一阶段
  const moveToNextPhase = () => {
    if (phase === 'contract') {
      setPhase('hold')
      setCountdown(PHASE_DURATIONS.hold)
      setScale(0.3) // 收缩到最小
    } else if (phase === 'hold') {
      setPhase('relax')
      setCountdown(PHASE_DURATIONS.relax)
    } else if (phase === 'relax') {
      setScale(1.0) // 放松到最大
      // 完成一组
      if (currentSet < totalSets) {
        setCurrentSet(prev => prev + 1)
        setPhase('contract')
        setCountdown(PHASE_DURATIONS.contract)
      } else {
        // 完成所有组数
        setIsCompleted(true)
        if (onComplete) {
          onComplete()
        }
      }
    }
    phaseStartTimeRef.current = Date.now()
  }

  // 更新缩放比例（平滑过渡）
  const updateScale = (timeProgress: number) => {
    if (phase === 'contract') {
      // 从1.0缩小到0.3
      setScale(1.0 - timeProgress * 0.7)
    } else if (phase === 'relax') {
      // 从0.3放大到1.0
      setScale(0.3 + timeProgress * 0.7)
    }
    // hold阶段保持0.3不变
  }

  // 主计时器
  useEffect(() => {
    if (isPaused || isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - phaseStartTimeRef.current) / 1000
      const duration = PHASE_DURATIONS[phase]
      const remaining = Math.ceil(duration - elapsed)
      const timeProgress = Math.min(elapsed / duration, 1)

      if (remaining <= 0) {
        moveToNextPhase()
      } else {
        setCountdown(remaining)
        updateScale(timeProgress)
      }
    }, 100) // 每100ms更新一次，使动画更流畅

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [phase, isPaused, isCompleted, currentSet])

  // 切换暂停/继续
  const togglePause = () => {
    if (isPaused) {
      // 继续：重置开始时间，减去已过的时间
      phaseStartTimeRef.current = Date.now() - (PHASE_DURATIONS[phase] - countdown) * 1000
    } else {
      // 暂停：保存当前倒计时
      pausedCountdownRef.current = countdown
    }
    setIsPaused(!isPaused)
  }

  // 跳过当前组
  const skipSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1)
      setPhase('contract')
      setCountdown(PHASE_DURATIONS.contract)
      setScale(1.0)
      phaseStartTimeRef.current = Date.now()
    } else {
      setIsCompleted(true)
      if (onComplete) {
        onComplete()
      }
    }
  }

  return {
    phase,
    currentSet,
    totalSets,
    countdown,
    scale,
    isPaused,
    isCompleted,
    progress,
    togglePause,
    skipSet,
  }
}

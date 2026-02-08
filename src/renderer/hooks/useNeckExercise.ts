/**
 * 颈椎运动控制逻辑 Hook
 */

import { useState, useEffect, useRef } from 'react'

interface UseNeckExerciseReturn {
  phase: 'left' | 'hold-left' | 'center' | 'right' | 'hold-right' | 'center-final'
  currentSet: number
  totalSets: number
  countdown: number
  rotation: number
  isPaused: boolean
  isCompleted: boolean
  progress: number
  togglePause: () => void
  skipSet: () => void
}

const PHASE_DURATIONS = {
  'left': 3,
  'hold-left': 2,
  'center': 2,
  'right': 3,
  'hold-right': 2,
  'center-final': 2
}

type Phase = keyof typeof PHASE_DURATIONS

const PHASE_SEQUENCE: Phase[] = ['left', 'hold-left', 'center', 'right', 'hold-right', 'center-final']

export function useNeckExercise(
  totalSets: number = 8,
  onComplete?: () => void
): UseNeckExerciseReturn {
  const [currentSet, setCurrentSet] = useState(1)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(PHASE_DURATIONS.left)
  const [rotation, setRotation] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseStartTimeRef = useRef(Date.now())

  const phase = PHASE_SEQUENCE[phaseIndex]

  // 计算总进度
  const progress = ((currentSet - 1) * 6 + phaseIndex) / (totalSets * 6)

  // 更新旋转角度
  const updateRotation = (timeProgress: number) => {
    const currentPhase = PHASE_SEQUENCE[phaseIndex]
    
    switch (currentPhase) {
      case 'left':
        setRotation(-45 * timeProgress)
        break
      case 'hold-left':
        setRotation(-45)
        break
      case 'center':
        setRotation(-45 * (1 - timeProgress))
        break
      case 'right':
        setRotation(45 * timeProgress)
        break
      case 'hold-right':
        setRotation(45)
        break
      case 'center-final':
        setRotation(45 * (1 - timeProgress))
        break
    }
  }

  // 移动到下一阶段
  const moveToNextPhase = () => {
    if (phaseIndex < PHASE_SEQUENCE.length - 1) {
      // 移到下一个阶段
      const nextIndex = phaseIndex + 1
      setPhaseIndex(nextIndex)
      setCountdown(PHASE_DURATIONS[PHASE_SEQUENCE[nextIndex]])
    } else {
      // 完成一组，开始新的一组
      if (currentSet < totalSets) {
        setCurrentSet(prev => prev + 1)
        setPhaseIndex(0)
        setCountdown(PHASE_DURATIONS.left)
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
        updateRotation(timeProgress)
      }
    }, 100) // 每100ms更新一次

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [phaseIndex, isPaused, isCompleted, currentSet])

  // 切换暂停/继续
  const togglePause = () => {
    if (isPaused) {
      // 继续：重置开始时间
      phaseStartTimeRef.current = Date.now() - (PHASE_DURATIONS[phase] - countdown) * 1000
    }
    setIsPaused(!isPaused)
  }

  // 跳过当前组
  const skipSet = () => {
    if (currentSet < totalSets) {
      setCurrentSet(prev => prev + 1)
      setPhaseIndex(0)
      setCountdown(PHASE_DURATIONS.left)
      setRotation(0)
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
    rotation,
    isPaused,
    isCompleted,
    progress,
    togglePause,
    skipSet,
  }
}

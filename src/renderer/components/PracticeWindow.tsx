/**
 * 跟练窗口主组件
 */

import { useEffect, useState } from 'react'
import { ReminderType } from '../../shared/types'
import { useKiegelExercise } from '../hooks/useKiegelExercise'
import { useNeckExercise } from '../hooks/useNeckExercise'
import ChrysanthemumAnimation from './ChrysanthemumAnimation'
import NeckExerciseAnimation from './NeckExerciseAnimation'
import CountdownDisplay from './CountdownDisplay'
import SetProgress from './SetProgress'
import CompletionAnimation from './CompletionAnimation'

interface PracticeWindowProps {
  exerciseType: 'kegel' | 'neck'
  reminderId?: string
  onClose: () => void
}

const EXERCISE_META = {
  kegel: {
    title: '提肛运动',
    totalSets: 10,
    phaseDurations: { contract: 5, hold: 5, relax: 10 }
  },
  neck: {
    title: '颈椎运动',
    totalSets: 8,
    phaseDurations: { 
      left: 3, 
      'hold-left': 2, 
      center: 2, 
      right: 3, 
      'hold-right': 2, 
      'center-final': 2 
    }
  }
}

export default function PracticeWindow({ 
  exerciseType, 
  reminderId, 
  onClose 
}: PracticeWindowProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const meta = EXERCISE_META[exerciseType]

  // 根据类型选择对应的 hook
  const kiegelExercise = exerciseType === 'kegel' 
    ? useKiegelExercise(meta.totalSets, handleExerciseComplete)
    : null

  const neckExercise = exerciseType === 'neck'
    ? useNeckExercise(meta.totalSets, handleExerciseComplete)
    : null

  const exercise = kiegelExercise || neckExercise!

  // 完成处理
  async function handleExerciseComplete() {
    setIsCompleting(true)
    
    // 1. 标记提醒为已完成
    if (reminderId) {
      try {
        await window.api.markAsCompleted(exerciseType === 'kegel' ? 'kegel' : 'neck')
      } catch (error) {
        console.error('Failed to mark as completed:', error)
      }
    }
    
    // 2. 延迟2秒后自动关闭窗口
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  // 关闭窗口
  const handleClose = () => {
    onClose()
  }

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const phaseDuration = exerciseType === 'kegel'
    ? (meta.phaseDurations as any)[kiegelExercise!.phase]
    : (meta.phaseDurations as any)[neckExercise!.phase]

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center practice-modal animate-fade-in"
      onClick={handleClose}
    >
      {/* 半透明遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm practice-modal-overlay" />
      
      {/* 内容区 */}
      <div 
        className="relative bg-white rounded-3xl shadow-2xl w-[550px] max-h-[90vh] overflow-hidden transform transition-all duration-300 practice-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between practice-header">
          <h2 className="text-xl font-bold text-gray-800">{meta.title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* 动画展示区域 */}
        <div className="flex items-center justify-center h-[350px] bg-gradient-to-br from-pink-50 to-red-50 relative overflow-hidden practice-animation-area">
          {exerciseType === 'kegel' && kiegelExercise && (
            <ChrysanthemumAnimation 
              phase={kiegelExercise.phase}
              scale={kiegelExercise.scale}
            />
          )}
          {exerciseType === 'neck' && neckExercise && (
            <NeckExerciseAnimation
              phase={neckExercise.phase}
              rotation={neckExercise.rotation}
            />
          )}
        </div>

        {/* 信息展示区 */}
        <div className="px-6 py-4 space-y-4 practice-info-section">
          <CountdownDisplay
            countdown={exercise.countdown}
            phase={exercise.phase}
            phaseDuration={phaseDuration}
          />
          
          <SetProgress
            currentSet={exercise.currentSet}
            totalSets={exercise.totalSets}
            overallProgress={exercise.progress}
          />
        </div>

        {/* 控制按钮 */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-center practice-controls">
          <button
            onClick={exercise.togglePause}
            className="px-6 py-2 rounded-lg font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            {exercise.isPaused ? '继续' : '暂停'}
          </button>
          <button
            onClick={exercise.skipSet}
            className="px-6 py-2 rounded-lg font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            跳过
          </button>
        </div>

        {/* 完成动画 */}
        {isCompleting && <CompletionAnimation />}
      </div>
    </div>
  )
}

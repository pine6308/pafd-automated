/**
 * 倒计时显示组件
 */

interface CountdownDisplayProps {
  countdown: number
  phase: string
  phaseDuration: number
}

const PHASE_TEXT: Record<string, string> = {
  'contract': '收缩',
  'hold': '保持',
  'relax': '放松',
  'left': '向左转',
  'hold-left': '保持',
  'center': '回正',
  'right': '向右转',
  'hold-right': '保持',
  'center-final': '回正'
}

export default function CountdownDisplay({ 
  countdown, 
  phase, 
  phaseDuration 
}: CountdownDisplayProps) {
  const phaseText = PHASE_TEXT[phase] || '运动中'
  const progressPercent = ((phaseDuration - countdown) / phaseDuration) * 100

  return (
    <div className="countdown-section space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">当前动作:</span>
        <span className="text-2xl font-bold text-pink-600">
          {phaseText}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">倒计时:</span>
        <span className="text-4xl font-bold text-pink-600 tabular-nums">
          {countdown}
          <span className="text-xl ml-1">秒</span>
        </span>
      </div>
      
      {/* 当前动作进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-pink-400 to-red-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}

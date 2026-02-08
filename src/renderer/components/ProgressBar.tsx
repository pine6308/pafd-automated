interface ProgressBarProps {
  completed: number
  total: number
  className?: string
}

/**
 * 进度条组件
 * 显示今日完成进度
 */
export function ProgressBar({ completed, total, className = '' }: ProgressBarProps) {
  // 确保进度不超过100%
  const percentage = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0
  
  // 显示的完成数也不超过目标数（UI显示优化）
  const displayCompleted = Math.min(completed, total)

  return (
    <div className={`progress-container ${className}`}>
      {/* 进度条 */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
        <div
          className="progress-bar-fill bg-gradient-to-r from-sky-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 进度文字 */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">今日完成</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          {displayCompleted}/{total} ({percentage}%)
        </span>
      </div>
      
      {/* 如果超额完成，显示提示 */}
      {completed > total && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-1">
          🎉 超额完成 {completed - total} 次！
        </div>
      )}
    </div>
  )
}

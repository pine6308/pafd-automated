/**
 * 组数进度显示组件
 */

interface SetProgressProps {
  currentSet: number
  totalSets: number
  overallProgress: number
}

export default function SetProgress({ 
  currentSet, 
  totalSets, 
  overallProgress 
}: SetProgressProps) {
  return (
    <div className="set-progress-section space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">训练进度:</span>
        <span className="text-xl font-bold text-gray-800">
          第 {currentSet}/{totalSets} 组
        </span>
      </div>
      
      {/* 总进度条 */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
          style={{ width: `${overallProgress * 100}%` }}
        >
          {/* 闪烁效果 */}
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        </div>
      </div>
      
      {/* 百分比显示 */}
      <div className="text-right text-sm text-gray-500">
        {Math.round(overallProgress * 100)}% 完成
      </div>
    </div>
  )
}

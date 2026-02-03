import { Heart, Coffee, Activity, RotateCcw } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-amber-50 flex flex-col items-center justify-center p-8 text-gray-800">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center gap-3">
          <Heart className="w-12 h-12 text-rose-500" strokeWidth={1.5} />
          <span className="text-2xl font-semibold text-rose-700">HealthReminder</span>
        </div>
        <h1 className="text-xl font-medium text-gray-700">健康提醒助手</h1>
        <p className="text-gray-600 leading-relaxed">
          定时提醒久坐办公族进行 4 种小活动：站起来、喝水、提肛、颈椎运动，让工作更健康。
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm">
            <Activity className="w-4 h-4" /> 站起来
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-sm">
            <Coffee className="w-4 h-4" /> 喝水
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm">
            <Heart className="w-4 h-4" /> 提肛
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 text-violet-800 text-sm">
            <RotateCcw className="w-4 h-4" /> 颈椎运动
          </span>
        </div>
        <p className="text-sm text-gray-500 pt-4">环境已就绪，接下来可以开始配置提醒与功能开发。</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-violet-100 flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-lg w-full space-y-8">
        {/* 大标题 */}
        <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
          健康提醒助手 ❤️
        </h1>

        {/* 副标题 */}
        <p className="text-xl text-gray-600 font-medium">
          定时提醒，健康生活
        </p>

        {/* 说明文字 */}
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>帮助久坐办公族养成健康习惯</p>
          <p>包含4种提醒：站立、喝水、提肛、颈椎运动</p>
        </div>

        {/* 当前状态 */}
        <div className="pt-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-medium text-sm">
            项目初始化成功 ✅
          </span>
        </div>
      </div>
    </div>
  )
}

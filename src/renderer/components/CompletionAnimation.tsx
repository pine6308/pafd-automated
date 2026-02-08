/**
 * 完成动画组件
 */

import { FlowerIcon } from './FlowerIcon'

export default function CompletionAnimation() {
  return (
    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-50 animate-fade-in">
      {/* 大号小红花 */}
      <div className="completion-flower mb-4">
        <FlowerIcon className="w-32 h-32" />
      </div>
      
      {/* 祝贺文字 */}
      <h2 className="text-3xl font-bold text-pink-600 mb-2 animate-bounce-in">
        太棒了！
      </h2>
      <p className="text-lg text-gray-600 animate-fade-in-delay">
        完成今日训练
      </p>
      
      {/* 闪烁星星 */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute sparkle text-2xl"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 0.1}s`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  )
}

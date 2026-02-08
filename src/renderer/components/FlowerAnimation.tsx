import { useEffect, useState } from 'react'
import { FlowerIcon } from './FlowerIcon'

interface FlowerAnimationProps {
  show: boolean
  onComplete?: () => void
}

/**
 * 小红花获得动画组件
 * 弹跳出现 + 周围闪烁星星效果
 */
export function FlowerAnimation({ show, onComplete }: FlowerAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 1200) // 动画持续1.2秒
      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative animate-flower-pop">
        <FlowerIcon className="w-20 h-20" />

        {/* 周围闪烁的星星 */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8
          const radius = 50
          const x = Math.cos((angle * Math.PI) / 180) * radius
          const y = Math.sin((angle * Math.PI) / 180) * radius

          return (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
              style={{
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

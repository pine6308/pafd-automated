/**
 * 提肛运动菊花动画组件
 * 设计风格：手绘感觉，类似小红花的简笔画画风
 * 颜色：参考emoji 🌼 的配色方案
 */

interface ChrysanthemumAnimationProps {
  phase: 'contract' | 'hold' | 'relax'
  scale: number // 0.3 (最小) 到 1.0 (最大)
}

export default function ChrysanthemumAnimation({ phase, scale }: ChrysanthemumAnimationProps) {
  const petalCount = 12 // 12片花瓣
  const baseRadius = 100 // 基础半径
  const currentRadius = baseRadius * scale

  // 生成手绘感的抖动
  const jitter = (base: number, seed: number) => {
    // 使用固定种子保证一致性，避免每次渲染都变化
    return base + (Math.sin(seed) * 0.5)
  }

  return (
    <svg 
      viewBox="0 0 300 300" 
      className="w-80 h-80 transition-all duration-1000 ease-in-out"
    >
      {/* 周围装饰小光点 - 金黄色系 */}
      <g className="decorative-dots">
        {[...Array(20)].map((_, i) => {
          const angle = i * 18
          const rad = (angle * Math.PI) / 180
          return (
            <circle
              key={i}
              cx={150 + Math.cos(rad) * (currentRadius + 50)}
              cy={150 + Math.sin(rad) * (currentRadius + 50)}
              r={jitter(2, i)}
              fill="#FFD700"
              opacity={0.6}
              className="animate-pulse"
            />
          )
        })}
      </g>
      
      {/* 12片花瓣 - 浅黄白色 */}
      <g className="petals">
        {[...Array(petalCount)].map((_, i) => {
          const angle = (i * 360) / petalCount
          const rad = (angle * Math.PI) / 180
          const petalX = 150 + Math.cos(rad) * (currentRadius * 0.6)
          const petalY = 150 + Math.sin(rad) * (currentRadius * 0.6)
          
          return (
            <ellipse
              key={i}
              cx={petalX}
              cy={petalY}
              rx={currentRadius * 0.4}
              ry={currentRadius * 0.25}
              fill="#FFFACD"
              stroke="#FFD700"
              strokeWidth="2"
              transform={`rotate(${angle} ${petalX} ${petalY})`}
              style={{
                transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'url(#hand-drawn)'
              }}
            />
          )
        })}
      </g>
      
      {/* 花心外圈 - 橙黄色 */}
      <circle
        cx="150"
        cy="150"
        r={currentRadius * 0.35}
        fill="#FFA500"
        className="transition-all duration-1000"
        style={{ filter: 'url(#hand-drawn)' }}
      />
      
      {/* 花心中心 - 深橙色 */}
      <circle
        cx="150"
        cy="150"
        r={currentRadius * 0.2}
        fill="#FF8C00"
        className="transition-all duration-1000"
        style={{ filter: 'url(#hand-drawn)' }}
      />
      
      {/* 中心小点装饰 - 白色高光 */}
      <circle cx="150" cy="150" r="5" fill="#FFF" opacity="0.8" />
      
      {/* 手绘感滤镜 */}
      <defs>
        <filter id="hand-drawn">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.05" 
            numOctaves="3" 
            result="noise"
          />
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale="2"
          />
        </filter>
      </defs>
    </svg>
  )
}

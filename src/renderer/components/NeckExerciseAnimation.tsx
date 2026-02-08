/**
 * 颈椎运动转动动画组件
 * 设计风格：手绘感线条，类似小红花画风
 */

interface NeckExerciseAnimationProps {
  phase: 'left' | 'hold-left' | 'center' | 'right' | 'hold-right' | 'center-final'
  rotation: number // -45度 到 +45度
}

export default function NeckExerciseAnimation({ phase, rotation }: NeckExerciseAnimationProps) {
  return (
    <svg viewBox="0 0 300 300" className="w-80 h-80">
      {/* 转动方向箭头 */}
      {(phase === 'left' || phase === 'hold-left') && (
        <g className="animate-pulse">
          <path
            d="M 80 150 Q 60 120, 80 90"
            stroke="#FFA500"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <polygon
            points="80,90 70,95 75,100"
            fill="#FFA500"
          />
        </g>
      )}
      
      {(phase === 'right' || phase === 'hold-right') && (
        <g className="animate-pulse">
          <path
            d="M 220 150 Q 240 120, 220 90"
            stroke="#FFA500"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <polygon
            points="220,90 230,95 225,100"
            fill="#FFA500"
          />
        </g>
      )}
      
      {/* 颈椎轮廓（固定） */}
      <g className="neck" stroke="#4682B4" strokeWidth="3" fill="none">
        <line x1="150" y1="180" x2="150" y2="240" strokeLinecap="round" />
        <ellipse cx="150" cy="250" rx="30" ry="15" stroke="#4682B4" strokeWidth="2" />
      </g>
      
      {/* 头部（可旋转） */}
      <g
        transform={`rotate(${rotation} 150 140)`}
        className="head transition-transform duration-1000 ease-in-out"
        style={{ transformOrigin: '150px 140px' }}
      >
        {/* 头部轮廓 */}
        <ellipse
          cx="150"
          cy="120"
          rx="50"
          ry="60"
          fill="#E0F4FF"
          stroke="#87CEEB"
          strokeWidth="3"
          style={{ filter: 'url(#hand-drawn-neck)' }}
        />
        
        {/* 五官简化 */}
        <circle cx="135" cy="110" r="4" fill="#4682B4" /> {/* 左眼 */}
        <circle cx="165" cy="110" r="4" fill="#4682B4" /> {/* 右眼 */}
        <path
          d="M 140 130 Q 150 135, 160 130"
          stroke="#4682B4"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        /> {/* 微笑 */}
      </g>
      
      {/* 运动线条效果 */}
      {rotation !== 0 && (
        <g className="motion-lines" opacity="0.5">
          {[...Array(3)].map((_, i) => (
            <path
              key={i}
              d={`M ${150 + rotation * 0.8} ${100 + i * 15} Q ${150 + rotation * 0.5} ${100 + i * 15}, ${150} ${100 + i * 15}`}
              stroke="#FFA500"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
              opacity={0.4 - i * 0.1}
              className="motion-trail"
            />
          ))}
        </g>
      )}
      
      {/* 手绘感滤镜 */}
      <defs>
        <filter id="hand-drawn-neck">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.05" 
            numOctaves="2"
          />
          <feDisplacementMap in="SourceGraphic" scale="1.5" />
        </filter>
      </defs>
    </svg>
  )
}

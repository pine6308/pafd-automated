interface FlowerIconProps {
  className?: string
}

/**
 * 小红花图标组件
 * 简笔画风格的五瓣花朵：红色花瓣 + 黄色花心
 */
export function FlowerIcon({ className = 'w-6 h-6' }: FlowerIconProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="小红花">
      {/* 五片花瓣 - 简笔画风格 */}
      <g className="flower-petals" fill="#E85D75">
        {/* 上 */}
        <circle cx="50" cy="25" r="18" />
        {/* 右上 */}
        <circle cx="73" cy="40" r="18" />
        {/* 右下 */}
        <circle cx="68" cy="68" r="18" />
        {/* 左下 */}
        <circle cx="32" cy="68" r="18" />
        {/* 左上 */}
        <circle cx="27" cy="40" r="18" />
      </g>

      {/* 黄色花心 */}
      <circle fill="#FFD93D" cx="50" cy="50" r="12" />

      {/* 装饰小光点 */}
      <circle className="sparkle" fill="#FFD93D" cx="20" cy="20" r="2" opacity="0.8" />
      <circle className="sparkle" fill="#FFD93D" cx="80" cy="25" r="2" opacity="0.8" />
      <circle className="sparkle" fill="#FFD93D" cx="75" cy="80" r="2" opacity="0.8" />
    </svg>
  )
}

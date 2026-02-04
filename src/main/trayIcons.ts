import { nativeImage } from 'electron'

// 1x1 红色像素 PNG (用于运行中)
const RED_1X1 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
// 1x1 灰色像素 PNG (用于暂停)
const GRAY_1X1 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const SIZE = 22 // macOS 推荐 22x22

export function getTrayImage(active: boolean): Electron.NativeImage {
  const base64 = active ? RED_1X1 : GRAY_1X1
  return nativeImage
    .createFromDataURL(`data:image/png;base64,${base64}`)
    .resize({ width: SIZE, height: SIZE })
}

import type { BoxBotConfig, Pt } from '../index.types'

/** 矩形定義(x/y/w/h)を頂点配列へ変換 */
export const rectPoints = ({ h, w, x, y }: BoxBotConfig['head']): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
]

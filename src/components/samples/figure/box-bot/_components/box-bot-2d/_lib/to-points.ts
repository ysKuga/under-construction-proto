import type { Pt } from '../index.types'

/** 頂点配列を SVG polyline の points 属性文字列へ変換 */
export const toPoints = (pts: Pt[]): string =>
  pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')

import type { Pt } from '../index.types'

/**
 * 折れ線を「手描き風」に粗くする
 *
 * - 各線分を長さに応じて分割し、中間点を法線方向へ ±amp、端点は控えめ(×0.35)にずらす
 * - closed=true なら始点へ戻る辺も追加する
 * - amp<=0 はそのまま返す
 */
export function roughen(
  points: Pt[],
  amp: number,
  freq: number,
  rng: () => number,
  closed: boolean,
): Pt[] {
  const src = closed ? [...points, points[0]] : points
  if (amp <= 0) return src
  const j = (): number => (rng() * 2 - 1) * amp
  const out: Pt[] = [[src[0][0] + j() * 0.35, src[0][1] + j() * 0.35]]
  for (let i = 0; i < src.length - 1; i++) {
    const [ax, ay] = src[i]
    const [bx, by] = src[i + 1]
    const dx = bx - ax,
      dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len,
      ny = dx / len // 単位法線
    const steps = Math.max(1, Math.round(len * freq))
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const off = (s === steps ? 0.35 : 1) * j()
      out.push([ax + dx * t + nx * off, ay + dy * t + ny * off])
    }
  }
  return out
}

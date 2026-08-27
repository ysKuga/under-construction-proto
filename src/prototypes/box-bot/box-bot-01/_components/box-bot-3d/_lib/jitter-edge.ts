import type { Vec3 } from '../index.types'

/**
 * 端点の振幅抑制率
 *
 * - 角の連結を保つため中間点より控えめにする
 */
const ENDPOINT_AMPLITUDE_SCALE = 0.25

/** 1辺を細分し 3D ジッター */
export function jitterEdge(
  a: Vec3,
  b: Vec3,
  amp: number,
  detail: number,
  rng: () => number,
): Vec3[] {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    dz = b[2] - a[2]
  const len = Math.hypot(dx, dy, dz) || 1
  const steps = Math.max(1, Math.round(len * detail))
  const pts: Vec3[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const m = i === 0 || i === steps ? ENDPOINT_AMPLITUDE_SCALE : 1
    const j = () => (rng() * 2 - 1) * amp * m
    pts.push([a[0] + dx * t + j(), a[1] + dy * t + j(), a[2] + dz * t + j()])
  }
  return pts
}

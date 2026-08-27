import type { Vec3 } from '../index.types'

/** 中心原点の箱の 12 辺(端点ペア) */
export function boxEdges(w: number, h: number, d: number): [Vec3, Vec3][] {
  const x = w / 2,
    y = h / 2,
    z = d / 2
  const c: Vec3[] = [
    [-x, -y, -z],
    [x, -y, -z],
    [x, y, -z],
    [-x, y, -z],
    [-x, -y, z],
    [x, -y, z],
    [x, y, z],
    [-x, y, z],
  ]
  const idx = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  return idx.map(([a, b]) => [c[a], c[b]] as [Vec3, Vec3])
}

import {
  STAGE_CENTER,
  STAGE_SCALE,
  STAGE_SIZE,
} from '../../time-control-02/_lib/stage-coords'
import { Position } from '../types'

export { STAGE_SIZE }

/** stage 表示に使う変換パラメータ */
export type StageTransform = {
  /** bounding box 中心の X 座標 (Position 空間) */
  centerX: number
  /** bounding box 中心の Y 座標 (Position 空間) */
  centerY: number
  /** Position 1単位あたりの px 数 */
  scale: number
}

/** actor が存在しない場合の既定 transform (time-control-02 と同じ表示) */
export const DEFAULT_TRANSFORM: StageTransform = {
  centerX: 0,
  centerY: 0,
  scale: STAGE_SCALE,
}

/** actor マーカーの半径相当。bounding box の外接ぎりぎりで欠けないための余白 */
const MARKER_PADDING = 12

/**
 * 全 actor の現在位置が stage 表示領域に収まる transform を算出する
 *
 * - bounding box の中心を新たな原点にする
 * - scale は縮小のみ (`STAGE_SCALE` を上限とし、拡大はしない)
 */
export const computeFitTransform = (positions: Position[]): StageTransform => {
  if (positions.length === 0) {
    return DEFAULT_TRANSFORM
  }

  const xs = positions.map((position) => position.x)
  const ys = positions.map((position) => position.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const availableSize = STAGE_SIZE - MARKER_PADDING * 2
  const requiredScale = Math.min(
    ...[maxX - minX, maxY - minY]
      .filter((size) => size > 0)
      .map((size) => availableSize / size),
  )

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    scale: Number.isFinite(requiredScale)
      ? Math.min(STAGE_SCALE, requiredScale)
      : STAGE_SCALE,
  }
}

/** Position を transform に基づき stage 上の CSS 絶対位置 (px) に変換する */
export const toPixelStyle = (
  position: Position,
  transform: StageTransform,
) => ({
  left: STAGE_CENTER + (position.x - transform.centerX) * transform.scale,
  top: STAGE_CENTER + (position.y - transform.centerY) * transform.scale,
})

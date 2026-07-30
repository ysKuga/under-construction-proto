import { Position } from '../types'

/** stage の一辺の長さ (px) */
export const STAGE_SIZE = 300

/** stage 中央の座標 (px)。Position { x: 0, y: 0 } をここに対応させる */
export const STAGE_CENTER = STAGE_SIZE / 2

/** Position 1単位あたりの px 数 */
export const STAGE_SCALE = 20

/** Position を stage 上の CSS 絶対位置 (px) に変換する */
export const toPixelStyle = (position: Position) => ({
  left: STAGE_CENTER + position.x * STAGE_SCALE,
  top: STAGE_CENTER + position.y * STAGE_SCALE,
})

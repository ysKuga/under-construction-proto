import { HexCell } from './hex'

/** ピクセル座標(中心点) */
export type PixelPoint = {
  /** 中心の x 座標 (px) */
  x: number
  /** 中心の y 座標 (px) */
  y: number
}

/**
 * flat-top 正六角形の clip-path（頂点角度 0/60/120/180/240/300 度）
 *
 * - 中心 (50%, 50%)・外接円半径 50% の頂点座標を固定値で列挙
 */
export const HEX_CLIP_PATH =
  'polygon(100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%, 25% 6.7%, 75% 6.7%)'

/**
 * axial 座標をピクセル座標(中心点)へ変換する（flat-top）
 *
 * @param cell axial 座標
 * @param hexSize 六角形の外接円半径 (px)
 */
export const axialToPixel = (cell: HexCell, hexSize: number): PixelPoint => {
  const x = hexSize * 1.5 * cell.q
  const y = hexSize * Math.sqrt(3) * (cell.r + cell.q / 2)

  return { x, y }
}

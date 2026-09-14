import { HexCell } from './hex'

/** ピクセル座標(中心点) */
export type PixelPoint = {
  /** 中心の x 座標 (px) */
  x: number
  /** 中心の y 座標 (px) */
  y: number
}

/** flat-top 正六角形の頂点角度（度） */
const HEX_VERTEX_ANGLES_DEG = [0, 60, 120, 180, 240, 300]

/**
 * flat-top 正六角形の SVG `points` 文字列を生成する
 *
 * - viewBox `0 0 (size*2) (size*sqrt(3))` を前提に、中心を viewBox 中央へ置く
 * - `border`/`clip-path` の組合せは辺の角度によって線の実効太さが変わり、
 *   セル間の隙間が不均一に見える問題があった。SVG の `polygon` + `stroke` は
 *   線幅が幾何学的に均一なため採用
 *
 * @param size 外接円半径 (px)
 * @param insetRatio セル間の隙間を作るための縮小率（0〜1、既定 1 でぴったり接する大きさ）
 */
export const hexPolygonPoints = (size: number, insetRatio = 1): string => {
  const radius = size * insetRatio
  const cx = size
  const cy = (size * Math.sqrt(3)) / 2

  return HEX_VERTEX_ANGLES_DEG.map((deg) => {
    const rad = (deg * Math.PI) / 180
    const x = cx + radius * Math.cos(rad)
    const y = cy + radius * Math.sin(rad)

    return `${x},${y}`
  }).join(' ')
}

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

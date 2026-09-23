import { CSSProperties, memo } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

type PathPreviewLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * 表示する経路(現在地セルは含まない、通過セル列から対象セルまで)
   *
   * - 中継点経由の経路では同じセルを再訪しうる
   */
  path: HexCell[]
  /** 行数 */
  rows: number
}

/**
 * 非隣接セルクリック時の経路プレビュー表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。`path` の
 *   各セルへ小さい点マーカーを表示するだけの非対話層（`ObstacleLayer` 同型）
 * - 経路探索(BFS)自体は `index.tsx` が `findHexPath`（`stage-07/_lib/hex-path`）を
 *   呼んで行う。ここは表示のみを担う
 * - `registerVisibilityNode` は持たない。経路は未到達(視界外)セルを通ることが
 *   あるが、プレイヤーが選んだ移動先までの道筋を示す表示のため、到達済み表示の
 *   ON/OFF に関わらず常時表示する（他レイヤーの「未到達マスは隠す」方針とは
 *   目的が異なるための意図的な例外）
 * - 中継点を経由した経路の連結も `index.tsx` 側（`findHexPathViaWaypoints`）で行う
 * - 自動移動は `index.tsx` が表示中の経路を `Stage07Handle.followPath` へ渡して行う（issue #226）
 */
export const PathPreviewLayer = memo((props: PathPreviewLayerProps) => {
  const { cols, hexSize, path, rows } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)

  return (
    <>
      {path.map((cell, index) => {
        const center = hexCellCenter(cell, hexSize, bounds)

        const style: CSSProperties = {
          backgroundColor: '#0284c7',
          borderRadius: '50%',
          height: bounds.cellHeight * 0.25,
          left: center.x,
          pointerEvents: 'none',
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -50%)',
          width: bounds.cellWidth * 0.25,
        }

        // 同じセルを再訪しうるため、セル座標でなく経路上の順番をキーにする
        return <div key={index} style={style} />
      })}
    </>
  )
})

PathPreviewLayer.displayName = 'PathPreviewLayer'

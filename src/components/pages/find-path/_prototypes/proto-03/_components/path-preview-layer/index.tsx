import { CSSProperties, memo } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { useFollowPathStore } from '../../_stores/follow-path'

type PathPreviewLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * 表示する経路(現在地セルは含まない、通過セル列から対象セルまで)
   *
   * - 中継点経由の経路では同じセルを再訪しうる
   * - 自動移動中は使わず、follow-path store の `followingPath` を表示する
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
 * - 自動移動中は follow-path store（`_stores/follow-path`）を直接購読し、「実行」時点の
 *   経路から移動済みのマスを先頭から消す。1 マスごとの進行で親を経由せず自分自身のみが
 *   再レンダリングされる。経路から切り出さず元の経路の位置を key に保つため、残りの点の
 *   DOM は作り直されない
 */
export const PathPreviewLayer = memo((props: PathPreviewLayerProps) => {
  const { cols, hexSize, path, rows } = props

  const followingPath = useFollowPathStore((state) => state.followingPath)
  const followedCount = useFollowPathStore((state) => state.followedCount)
  /** 自動移動中か（「実行」時点の経路を表示する） */
  const isFollowing = useFollowPathStore((state) => state.isFollowing())
  /** 表示する経路 */
  const displayPath = isFollowing ? followingPath : path
  /** 先頭から表示しないマス数（自動移動で移動済みのマス） */
  const passedCount = isFollowing ? followedCount : 0

  const bounds = computeHexGridBounds(cols, rows, hexSize)

  return (
    <>
      {displayPath.map((cell, index) => {
        if (index < passedCount) return null

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

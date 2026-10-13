import { CSSProperties, memo } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { useStageLayout } from '../../_contexts/stage-layout'
import { useGoalFloorFlagHidden } from '../../_contents/goal-performance'

type GoalMarkerLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * ゴールセルの表示切替 DOM を visibility registry へ登録する
   *
   * - 省略時は常時表示（`VisibilityRegistryProvider` を持たない利用元向け）。
   *   渡した場合は到達済みマスへ隣接するまで旗が非表示になる
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
  /** 行数 */
  rows: number
}

/**
 * ゴールセルの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。盤面配置の
 *   ゴール (axial) のセル中心へマーカーを表示するだけの非対話層
 * - 座標計算は `GeoLayer`/`ActorsLayer` と同じ `computeHexGridBounds`/`hexCellCenter`
 *   を共有し、見た目位置がズレないようにする
 * - `pointerEvents: none` でクリックを下層（`GeoLayer`）へ通す
 * - `registerVisibilityNode` 経由でゴールセルの DOM を visibility registry へ登録する
 *   （渡された場合のみ）。可視状態の反映は registry 側の DOM 直書きに任せるため、
 *   ここでは再レンダリングを起こさない
 * - floor の tilt（`rotateX`）と一緒に寝ないよう、`ActorsLayer` の bot と同じく
 *   `rotateX(calc(-1 * var(--floor-tilt)))` で打ち消して直立させる（issue #137）
 * - `React.memo` 化済み（issue-181-en backlog）。EN 残量等の find-path 固有の
 *   状態変化に巻き込まれて再レンダリングしない
 * - ゴール到達後は床上の旗を透明にする。隠す判定はゴール演出（`GoalPerformance`）側の `useGoalFloorFlagHidden` に従う（issue #137）
 *   - 可視状態は registry が `visibility` を直書きするため、`opacity` で消して競合を避ける
 */
export const GoalMarkerLayer = memo((props: GoalMarkerLayerProps) => {
  const { cols, hexSize, registerVisibilityNode, rows } = props

  const { goal } = useStageLayout()
  /** 床上の旗を隠すか（ゴール到達後） */
  const goalFloorFlagHidden = useGoalFloorFlagHidden()

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(goal, hexSize, bounds)

  const style: CSSProperties = {
    alignItems: 'center',
    display: 'flex',
    fontSize: 20,
    height: bounds.cellHeight,
    justifyContent: 'center',
    left: center.x,
    opacity: goalFloorFlagHidden ? 0 : 1,
    pointerEvents: 'none',
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -50%) rotateX(calc(-1 * var(--floor-tilt)))',
    transformOrigin: 'center bottom',
    width: bounds.cellWidth,
  }

  return (
    <div ref={(el) => registerVisibilityNode?.(goal, el)} style={style}>
      🚩
    </div>
  )
})

GoalMarkerLayer.displayName = 'GoalMarkerLayer'

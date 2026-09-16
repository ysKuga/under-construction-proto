import { CSSProperties } from 'react'

import {
  HexCell,
  hexDirectionToScreenAngle,
} from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { DIRECTION_DELTA } from '../../_lib/one-way'
import { ONE_WAY_CELLS } from '../../constants'

type OneWayLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * 一方通行セルの DOM を visibility registry へ登録する
   *
   * - 省略時は常時表示。渡した場合は未到達マスへ隣接するまで矢印が非表示になる
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
  /** 行数 */
  rows: number
}

/**
 * 一方通行セルの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。`ONE_WAY_CELLS`
 *   の各セルへ退出方向へ向けた矢印を表示するだけの非対話層
 * - hex は6方向（60°刻み）のため矢印絵文字の出し分け（proto-01 は45°刻み4方向）では
 *   足りない。`hexDirectionToScreenAngle` の画面角度で単一矢印を CSS `rotate` する
 * - 座標計算は `ObstacleLayer` と同じ `computeHexGridBounds`/`hexCellCenter` を共有し、
 *   見た目位置がズレないようにする
 * - `pointerEvents: none` でクリックを下層（`GeoLayer`）へ通す。選択拒否自体は
 *   `Stage07` の `canEnterCell` 判定（`useHexMove` 組込み）で行う
 */
export const OneWayLayer = (props: OneWayLayerProps) => {
  const { cols, hexSize, registerVisibilityNode, rows } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)

  return (
    <>
      {ONE_WAY_CELLS.map((cell) => {
        const center = hexCellCenter(cell, hexSize, bounds)
        const delta = DIRECTION_DELTA[cell.exitDirection]
        const target = { q: cell.q + delta.q, r: cell.r + delta.r }
        const angleRad = hexDirectionToScreenAngle(cell, target) ?? 0

        const style: CSSProperties = {
          alignItems: 'center',
          display: 'flex',
          fontSize: 20,
          justifyContent: 'center',
          left: center.x,
          pointerEvents: 'none',
          position: 'absolute',
          top: center.y,
          transform: `translate(-50%, -50%) rotate(${(angleRad * 180) / Math.PI}deg)`,
        }

        return (
          <div
            key={`${cell.q},${cell.r}`}
            ref={(el) => registerVisibilityNode?.(cell, el)}
            style={style}
          >
            ➡️
          </div>
        )
      })}
    </>
  )
}

import { CSSProperties } from 'react'

import { HEX_INSET_RATIO } from '@/prototypes/stage/stage-07/_components/geo-layer'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { OneWayDirection, OPPOSITE_DIRECTION } from '../../_lib/one-way'
import { ONE_WAY_CELLS } from '../../constants'

type OneWayLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * 一方通行セルの DOM を visibility registry へ登録する
   *
   * - 省略時は常時表示。渡した場合は未到達マスへ隣接するまでバリア線が非表示になる
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
  /** 行数 */
  rows: number
}

/** flat-top 正六角形の頂点角度（度）。`hex-layout.ts` の `hexPolygonPoints` と同じ並び */
const HEX_VERTEX_ANGLES_DEG = [0, 60, 120, 180, 240, 300]

/** 進入禁止方向 → バリア線を引く頂点ペア（`HEX_VERTEX_ANGLES_DEG` のインデックス） */
const BARRIER_VERTEX_PAIR: Record<OneWayDirection, readonly [number, number]> =
  {
    left: [3, 4],
    'lower-left': [2, 3],
    'lower-right': [1, 2],
    right: [0, 1],
    'upper-left': [4, 5],
    'upper-right': [5, 0],
  }

/**
 * セルローカル座標(中心を `hexPolygonPoints` と同じ基準に置く)での頂点座標
 *
 * - `hex-layout.ts` の `hexPolygonPoints` と同じ式（頂点そのものではなく `points`
 *   文字列を返す関数のため、個別頂点座標が要るここでは式を複製する）
 */
const hexVertex = (index: number, hexSize: number) => {
  const radius = hexSize * HEX_INSET_RATIO
  const cx = hexSize
  const cy = (hexSize * Math.sqrt(3)) / 2
  const rad = (HEX_VERTEX_ANGLES_DEG[index] * Math.PI) / 180

  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

/**
 * 一方通行セルの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。`ONE_WAY_CELLS`
 *   の各セルへ進入禁止方向（退出方向の反対側）の辺だけバリア線を引く非対話層
 * - 矢印表示（退出方向を指す）は「その方向にしか行けない」ように見え、実際の判定
 *   （進入方向が退出方向の逆のときだけ拒否。それ以外は自由に出入り可）と見た目が
 *   食い違うため不採用（issue #137 検討。proto-01 `_components/one-way-layer` と同じ方針）
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
        const blockedDirection = OPPOSITE_DIRECTION[cell.exitDirection]
        const [i1, i2] = BARRIER_VERTEX_PAIR[blockedDirection]
        const v1 = hexVertex(i1, hexSize)
        const v2 = hexVertex(i2, hexSize)

        const style: CSSProperties = {
          height: bounds.cellHeight,
          left: center.x,
          pointerEvents: 'none',
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -50%)',
          width: bounds.cellWidth,
        }

        return (
          <div
            key={`${cell.q},${cell.r}`}
            ref={(el) => registerVisibilityNode?.(cell, el)}
            style={style}
          >
            <svg height={bounds.cellHeight} width={bounds.cellWidth}>
              <line
                stroke="#dc2626"
                strokeLinecap="round"
                strokeWidth={4}
                x1={v1.x}
                x2={v2.x}
                y1={v1.y}
                y2={v2.y}
              />
            </svg>
          </div>
        )
      })}
    </>
  )
}

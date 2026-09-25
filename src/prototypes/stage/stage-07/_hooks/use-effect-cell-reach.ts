import { RefObject, useEffect, useRef } from 'react'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { useStage07EventDispatcher } from '../_events'
import { judgeCellReach } from '../_lib/cell-reach'
import { HexCell } from '../_lib/hex'
import { computeHexGridBounds } from '../_lib/hex-layout'

/** 到達判定の間隔(セル間移動の所要時間に対する割合) */
const CELL_REACH_CHECK_INTERVAL_RATIO = 1 / 5

/**
 * actor の描画位置がセル中心に到達したら `Stage07-cell-reach` を発行する
 *
 * - セル間移動は CSS transition のため、途中の描画位置は `getComputedStyle` で読む
 * - `targetCell` の変化(移動開始)を契機に、`moveDurationMs` の
 *   `CELL_REACH_CHECK_INTERVAL_RATIO` 間隔で判定する。描画位置が移動先に着いたら
 *   判定を止める(停止中は判定しない)
 * - 判定条件は `judgeCellReach` 参照。同じセルでは 1 回だけ発行する
 * - 静止中の現在セル(マウント時・停止時)にも発行する
 *
 * @param actorId 対象 actor
 * @param elementRef actor の位置決め要素(`left`/`top` を transition させる要素)
 * @param targetCell actor の移動先セル(移動中でなければ現在セル)
 * @param cols 列数
 * @param rows 行数
 * @param hexSize 六角形の外接円半径 (px)
 * @param moveDurationMs セル間移動アニメーションの所要時間(ms)
 */
export const useEffectCellReach = (
  actorId: ActorId,
  elementRef: RefObject<HTMLElement | null>,
  targetCell: HexCell,
  cols: number,
  rows: number,
  hexSize: number,
  moveDurationMs: number,
) => {
  const stage07EventDispatcher = useStage07EventDispatcher()
  /** 最後に到達を発行したセル */
  const lastReachedCellRef = useRef<HexCell | undefined>(undefined)

  useEffect(() => {
    // 移動開始のたび、描画位置が移動先に着くまで一定間隔で到達を判定する
    const bounds = computeHexGridBounds(cols, rows, hexSize)

    const check = () => {
      const el = elementRef.current

      if (!el) return

      const computed = getComputedStyle(el)
      const position = {
        x: parseFloat(computed.left),
        y: parseFloat(computed.top),
      }
      const reachedCell = judgeCellReach(
        position,
        targetCell,
        lastReachedCellRef.current,
        hexSize,
        bounds,
      )

      if (reachedCell) {
        lastReachedCellRef.current = reachedCell
        void stage07EventDispatcher['Stage07-cell-reach']({
          actorId,
          cell: reachedCell,
        })
      }

      const isSettled =
        Math.hypot(
          parseFloat(el.style.left) - position.x,
          parseFloat(el.style.top) - position.y,
        ) < 0.01

      if (isSettled) clearInterval(id)
    }

    const id = setInterval(
      check,
      moveDurationMs * CELL_REACH_CHECK_INTERVAL_RATIO,
    )

    return () => clearInterval(id)
  }, [
    actorId,
    cols,
    elementRef,
    hexSize,
    moveDurationMs,
    rows,
    stage07EventDispatcher,
    targetCell,
  ])
}

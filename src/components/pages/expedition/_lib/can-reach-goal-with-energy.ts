import {
  HEX_DIRECTIONS,
  HexCell,
  isHexCellInGrid,
} from '@/prototypes/stage/stage-07/_lib/hex'

import { StageLayout } from '../_contexts/stage-layout/types'

import { canEnterForPath } from './can-enter-for-path'
import { isSameCell } from './is-same-cell'

/** 到達判定に使う EN の条件 */
export type StageEnergyRule = {
  /** 携行できる EN 補給アイテムの上限数 */
  carryCapacity: number
  /** 1 マスの移動あたりの消費量 */
  consumePerMove: number
  /** 初期値 */
  current: number
  /** 上限 */
  max: number
}

/** 探索の状態 */
type SearchState = {
  /** 現在のセル */
  cell: HexCell
  /** 携行中のアイテムの補給量（昇順） */
  carried: readonly number[]
  /** EN 残量 */
  energy: number
  /** 盤面に残っているアイテム（`layout.items` の添字のビット） */
  itemMask: number
  /** スポットごとの残りの補給回数（`layout.spots` の添字順） */
  spotStocks: readonly number[]
}

/** 探索済み判定用のキー */
const toKey = (state: SearchState): string =>
  [
    state.cell.q,
    state.cell.r,
    state.energy,
    state.itemMask,
    state.carried.join('.'),
    state.spotStocks.join('.'),
  ].join(',')

/**
 * EN を考慮して、開始セルからゴールへ到達できるか
 *
 * - `(セル, EN 残量, 盤面に残るアイテム, 携行アイテム, スポット残量)` の状態空間を幅優先で探索する（issue #315）
 * - 遷移は proto-03 の挙動に合わせる
 *   - 移動: EN が残っていれば隣接セルへ進み `consumePerMove` 消費（0 未満にはならない）。\
 *     進入先のアイテムは携行上限に達していなければ携行する
 *   - アイテム使用: 携行中のアイテムを任意のタイミングで使い補給する（上限を超えない）
 *   - スポット使用: 現在セルのスポットで、上限までの不足分を残量の範囲でまとめて補給する
 * - ゴールへ進入した時点で到達とみなす（到達時の EN は 0 でよい）
 *
 * @param layout 盤面配置
 * @param grid グリッド形状
 * @param rule EN の条件
 */
export const canReachGoalWithEnergy = (
  layout: StageLayout,
  grid: { cols: number; rows: number },
  rule: StageEnergyRule,
): boolean => {
  const initial: SearchState = {
    carried: [],
    cell: layout.start,
    energy: rule.current,
    itemMask: (1 << layout.items.length) - 1,
    spotStocks: layout.spots.map((spot) => spot.stock),
  }
  const visited = new Set([toKey(initial)])
  const queue = [initial]
  /** 状態を未探索なら探索対象へ加える */
  const enqueue = (state: SearchState) => {
    const key = toKey(state)

    if (visited.has(key)) return

    visited.add(key)
    queue.push(state)
  }

  for (let head = 0; head < queue.length; head++) {
    const state = queue[head]

    // EN が残っている: 隣接セルへ移動する
    if (state.energy > 0) {
      for (const direction of HEX_DIRECTIONS) {
        const next = {
          q: state.cell.q + direction.q,
          r: state.cell.r + direction.r,
        }

        if (!isHexCellInGrid(next, grid.cols, grid.rows)) continue
        if (!canEnterForPath(state.cell, next, layout)) continue
        if (isSameCell(next, layout.goal)) return true

        const itemIndex = layout.items.findIndex(
          (item, index) =>
            (state.itemMask & (1 << index)) !== 0 && isSameCell(item, next),
        )
        /** 進入先のアイテムを携行するか（上限に達していればその場に残す） */
        const pickUp =
          itemIndex >= 0 && state.carried.length < rule.carryCapacity

        enqueue({
          carried: pickUp
            ? [...state.carried, layout.items[itemIndex].amount].sort(
                (a, b) => a - b,
              )
            : state.carried,
          cell: next,
          energy: Math.max(0, state.energy - rule.consumePerMove),
          itemMask: pickUp
            ? state.itemMask & ~(1 << itemIndex)
            : state.itemMask,
          spotStocks: state.spotStocks,
        })
      }
    }

    // EN が満タン: 補給しても増えないため使用しない
    if (state.energy >= rule.max) continue

    // 携行中のアイテムを使う（同じ補給量は1通りのみ試す）
    for (const amount of new Set(state.carried)) {
      const index = state.carried.indexOf(amount)

      enqueue({
        ...state,
        carried: state.carried.filter((_, i) => i !== index),
        energy: Math.min(rule.max, state.energy + amount),
      })
    }

    const spotIndex = layout.spots.findIndex((spot) =>
      isSameCell(spot, state.cell),
    )

    // 現在セルにスポットがない: 補給できない
    if (spotIndex < 0) continue

    const spot = layout.spots[spotIndex]
    /** 補給回数（上限までの不足分とスポット残量の小さい方） */
    const count = Math.min(
      Math.ceil((rule.max - state.energy) / spot.amount),
      state.spotStocks[spotIndex],
    )

    // スポットが枯渇している: 補給できない
    if (count <= 0) continue

    enqueue({
      ...state,
      energy: Math.min(rule.max, state.energy + count * spot.amount),
      spotStocks: state.spotStocks.map((stock, i) =>
        i === spotIndex ? stock - count : stock,
      ),
    })
  }

  return false
}

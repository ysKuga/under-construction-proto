'use client'

import { useEffect, useState } from 'react'

import {
  colRowToAxial,
  HexCell,
  isHexAdjacent,
} from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
  PixelPoint,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

/** 非表示 → 表示演出開始までの遅延 (ms) */
const SPAWN_DELAY_MS = 80

/** `scatter` モードの集合表示中の拡大率 */
const SCATTER_ORIGIN_SCALE = 0.3

/** 表示演出の種類 */
export type MoveTargetDisplayMode =
  /** 対象セルの位置で opacity 0→1 のみ（位置移動なし） */
  | 'fade'
  /** transition なしで対象セルへ即座に出現 */
  | 'instant'
  /** bot マスへ集合表示 → 対象セルへ散開（既定） */
  | 'scatter'

/** 移動可能マス1件ぶんの表示情報 */
type MoveTarget = {
  /** 対象セル */
  cell: HexCell
  /** 不透明度（`fade` モードの `spawned` 段階のみ 0、それ以外は 1） */
  opacity: number
  /** 表示位置 */
  position: PixelPoint
  /** 拡大率（`scatter` モードの `spawned` 段階のみ `SCATTER_ORIGIN_SCALE`、それ以外は 1） */
  scale: number
}

/** 表示演出の段階 */
type Phase = 'hidden' | 'revealed' | 'spawned'

/** グリッド全セルのうち current に隣接するセル（＝移動可能マス）を列挙する */
const reachableCellsOf = (
  current: HexCell,
  cols: number,
  rows: number,
): HexCell[] =>
  Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: cols })
      .map((_, col) => colRowToAxial(col, row))
      .filter((cell) => isHexAdjacent(current, cell)),
  )

/**
 * mode/phase から表示位置を決める
 *
 * - `scatter` の `spawned`（集合表示中）のみ bot マス中心、それ以外は対象セル中心
 */
const positionOf = (
  mode: MoveTargetDisplayMode,
  phase: Phase,
  originPosition: PixelPoint,
  targetPosition: PixelPoint,
): PixelPoint =>
  mode === 'scatter' && phase === 'spawned' ? originPosition : targetPosition

/**
 * mode/phase から不透明度を決める
 *
 * - `fade` の `spawned`（出現直前）のみ 0、それ以外は 1
 */
const opacityOf = (mode: MoveTargetDisplayMode, phase: Phase): number =>
  mode === 'fade' && phase === 'spawned' ? 0 : 1

/**
 * mode/phase から拡大率を決める
 *
 * - `scatter` の `spawned`（bot マスへの集合表示中）のみ `SCATTER_ORIGIN_SCALE`
 *   （小さく表示）、それ以外は等倍。散開の移動と同時に拡大させることで
 *   「中心から生まれて広がる」印象を強める
 */
const scaleOf = (mode: MoveTargetDisplayMode, phase: Phase): number =>
  mode === 'scatter' && phase === 'spawned' ? SCATTER_ORIGIN_SCALE : 1

/**
 * 移動可能マスの表示演出（非表示 → 出現準備 → 表示）を管理する
 *
 * - 現在地セル変更のたび非表示へ戻し、`SPAWN_DELAY_MS` 経過後に演出開始
 *   （`spawned`）→ 直後の次フレームで表示完了（`revealed`）へ切替える
 * - `spawned`/`revealed` それぞれの位置・不透明度・拡大率は `mode` によって変わる
 *   （`positionOf`/`opacityOf`/`scaleOf` 参照）。`spawned`→`revealed` の値の変化を
 *   呼び出し元コンポーネント側の CSS transition が拾うことでアニメーションになる
 *   （`instant` は両段階で値が変わらないため transition が発火せず、結果として
 *   即座に出現して見える）
 * - 表示完了後は次の現在地セル変更（bot 移動完了）まで維持し、変更時点で
 *   非表示へ戻る（初期表示と同一の見た目）
 *
 * @param currentCell 現在地セル
 * @param cols グリッド列数
 * @param hexSize 六角形の外接円半径 (px)
 * @param mode 表示演出の種類
 * @param rows グリッド行数
 */
export const useMoveTargetLayer = (
  currentCell: HexCell,
  cols: number,
  hexSize: number,
  mode: MoveTargetDisplayMode,
  rows: number,
): MoveTarget[] => {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [trackedCell, setTrackedCell] = useState(currentCell)

  // 現在地セル変更を検知し次第、非表示へ戻す（レンダー中の同期更新。
  // useEffect 内で直接 setState すると連鎖レンダーになるため避ける）
  if (trackedCell.q !== currentCell.q || trackedCell.r !== currentCell.r) {
    setTrackedCell(currentCell)
    setPhase('hidden')
  }

  // 非表示化後、SPAWN_DELAY_MS 経過で演出を開始する
  useEffect(() => {
    if (phase !== 'hidden') {
      return
    }

    const timer = setTimeout(() => setPhase('spawned'), SPAWN_DELAY_MS)

    return () => clearTimeout(timer)
  }, [phase, trackedCell.q, trackedCell.r])

  // 演出開始の直後、次フレームで表示完了へ切替える（同一フレーム内の変更だと
  // transition が発火しないため1フレーム置く）
  useEffect(() => {
    if (phase !== 'spawned') {
      return
    }

    const frame = requestAnimationFrame(() => setPhase('revealed'))

    return () => cancelAnimationFrame(frame)
  }, [phase])

  if (phase === 'hidden') {
    return []
  }

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const originPosition = hexCellCenter(currentCell, hexSize, bounds)

  return reachableCellsOf(currentCell, cols, rows).map((cell) => {
    const targetPosition = hexCellCenter(cell, hexSize, bounds)

    return {
      cell,
      opacity: opacityOf(mode, phase),
      position: positionOf(mode, phase, originPosition, targetPosition),
      scale: scaleOf(mode, phase),
    }
  })
}

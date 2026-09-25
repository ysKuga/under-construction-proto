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

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'

/** 非表示 → 表示演出開始までの遅延 (ms) */
const SPAWN_DELAY_MS = 80

/** 表示・引っ込みの CSS transition の所要時間 (ms) */
export const MOVE_TARGET_TRANSITION_MS = 200

/** `scatter` モードの集合表示中の拡大率 */
const SCATTER_ORIGIN_SCALE = 0.3

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

/**
 * 表示演出の段階
 *
 * - `hidden`: 非表示
 * - `spawned`: 出現準備（集合・透明等、`revealed` へ transition する起点）
 * - `revealed`: 表示完了
 * - `retracting`: 引っ込み中（`spawned` と同じ見た目へ transition し、完了後 `hidden`）
 */
type Phase = 'hidden' | 'retracting' | 'revealed' | 'spawned'

/** 集合・透明等、表示完了前（または引っ込み）の見た目にする段階か */
const isGathered = (phase: Phase) =>
  phase === 'spawned' || phase === 'retracting'

/**
 * グリッド全セルのうち current に隣接し、かつ進入可能なセル（＝移動可能マス）を
 * 列挙する
 */
const reachableCellsOf = (
  current: HexCell,
  cols: number,
  rows: number,
  canEnter?: (cell: HexCell) => boolean,
): HexCell[] =>
  Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: cols })
      .map((_, col) => colRowToAxial(col, row))
      .filter(
        (cell) => isHexAdjacent(current, cell) && (canEnter?.(cell) ?? true),
      ),
  )

/**
 * mode/phase から表示位置を決める
 *
 * - `scatter` の `spawned`/`retracting`（集合表示中）のみ bot マス中心、それ以外は対象セル中心
 */
const positionOf = (
  mode: MoveTargetDisplayMode,
  phase: Phase,
  originPosition: PixelPoint,
  targetPosition: PixelPoint,
): PixelPoint =>
  mode === 'scatter' && isGathered(phase) ? originPosition : targetPosition

/**
 * mode/phase から不透明度を決める
 *
 * - `fade` の `spawned`/`retracting`（出現直前・引っ込み）のみ 0、それ以外は 1
 */
const opacityOf = (mode: MoveTargetDisplayMode, phase: Phase): number =>
  mode === 'fade' && isGathered(phase) ? 0 : 1

/**
 * mode/phase から拡大率を決める
 *
 * - `scatter` の `spawned`/`retracting`（bot マスへの集合表示中）のみ `SCATTER_ORIGIN_SCALE`
 *   （小さく表示）、それ以外は等倍。散開の移動と同時に拡大させることで
 *   「中心から生まれて広がる」印象を強める
 */
const scaleOf = (mode: MoveTargetDisplayMode, phase: Phase): number =>
  mode === 'scatter' && isGathered(phase) ? SCATTER_ORIGIN_SCALE : 1

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
 * - `isEnabled`（EN 残量あり等）が `false` になったら、表示と逆の演出で引っ込める
 *   （`retracting` → `MOVE_TARGET_TRANSITION_MS` 後に `hidden`）。`instant` は即座に
 *   非表示にする。`true` に戻ったら、現在地セル変更時と同じ演出で表示する
 *
 * @param currentCell 現在地セル
 * @param cols グリッド列数
 * @param hexSize 六角形の外接円半径 (px)
 * @param isEnabled 移動可能マスを表示するか（EN 切れ時 `false`）
 * @param mode 表示演出の種類
 * @param rows グリッド行数
 * @param canEnter 対象セルへ進入可能か（省略時は常に進入可能）。障害物セル等を
 *   移動可能マス表示から除外する
 */
export const useMoveTargetLayer = (
  currentCell: HexCell,
  cols: number,
  hexSize: number,
  isEnabled: boolean,
  mode: MoveTargetDisplayMode,
  rows: number,
  canEnter?: (cell: HexCell) => boolean,
): MoveTarget[] => {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [trackedCell, setTrackedCell] = useState(currentCell)
  const [trackedIsEnabled, setTrackedIsEnabled] = useState(isEnabled)

  const isCellChanged =
    trackedCell.q !== currentCell.q || trackedCell.r !== currentCell.r

  // 現在地セル・有効/無効の変更を検知し次第、段階を切り替える（レンダー中の同期更新。
  // useEffect 内で直接 setState すると連鎖レンダーになるため避ける）
  // - 表示中のまま無効化された場合のみ引っ込める（instant は即座に非表示）
  // - それ以外（セル変更・有効化）は非表示へ戻し、出現演出をやり直す
  if (isCellChanged || trackedIsEnabled !== isEnabled) {
    const shouldRetract =
      !isCellChanged && !isEnabled && phase !== 'hidden' && mode !== 'instant'

    setTrackedCell(currentCell)
    setTrackedIsEnabled(isEnabled)
    setPhase(shouldRetract ? 'retracting' : 'hidden')
  }

  // 非表示化後、有効なら SPAWN_DELAY_MS 経過で演出を開始する
  useEffect(() => {
    if (phase !== 'hidden' || !isEnabled) {
      return
    }

    const timer = setTimeout(() => setPhase('spawned'), SPAWN_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isEnabled, phase, trackedCell.q, trackedCell.r])

  // 引っ込み演出（transition）の完了後、非表示にする
  useEffect(() => {
    if (phase !== 'retracting') {
      return
    }

    const timer = setTimeout(
      () => setPhase('hidden'),
      MOVE_TARGET_TRANSITION_MS,
    )

    return () => clearTimeout(timer)
  }, [phase])

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

  return reachableCellsOf(currentCell, cols, rows, canEnter).map((cell) => {
    const targetPosition = hexCellCenter(cell, hexSize, bounds)

    return {
      cell,
      opacity: opacityOf(mode, phase),
      position: positionOf(mode, phase, originPosition, targetPosition),
      scale: scaleOf(mode, phase),
    }
  })
}

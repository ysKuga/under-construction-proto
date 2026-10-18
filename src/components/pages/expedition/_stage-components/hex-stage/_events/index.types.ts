import { Actor } from '@/types/theater/actor'

import { HexCell } from '../_lib/hex'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `HexStage-`
 * - `HexStage` が actor の状態変化・セルの hover を通知する。find-path 固有の概念は持たない
 */
export type HexStageEventMap = {
  /**
   * actor の描画位置がセル中心に到達した
   *
   * - `HexStage-move-start` は進入開始時のため、見た目上の到達はこちらで知る
   * - 中心の一定範囲内に入った時点、または判定時に中心を過ぎていた時点で発行する\
   *   （`judgeCellReach`）。同じセルでは 1 回のみ
   * - 静止中の現在セル（マウント時・停止時）にも発行する
   */
  'HexStage-cell-reach': {
    /** 対象 actor */
    actorId: Actor['id']
    /** 到達したセル */
    cell: HexCell
  }
  /**
   * セルがクリックされた
   *
   * - クリックの分類（現在セル・移動可・不可）は行わず、セルのみ通知する
   * - 非対話（`interactive=false`）のセルでは発行しない
   */
  'HexStage-cell-click': {
    /** クリックされたセル */
    cell: HexCell
  }
  /**
   * pointer の hover 中セルが変わった
   *
   * - セル進入時にそのセル、layer 外へ出た時に `undefined`（hover 解除）
   * - セル間の移動では解除を挟まず、移動先のセルのみ発行する
   * - 非対話（`interactive=false`）のセルでは発行しない（`pointerEvents: none`）
   */
  'HexStage-cell-hover': {
    /** hover 中のセル（`undefined` は hover 解除） */
    cell: HexCell | undefined
  }
  /** actor がセル間の移動を開始した（自動移動では 1 マスごとに発行する） */
  'HexStage-move-start': {
    /** 対象 actor */
    actorId: Actor['id']
  }
  /**
   * actor の移動が止まった
   *
   * - 隣接クリックでの移動は到着時、`followPath` による自動移動は終了時に発行する\
   *   （自動移動の途中の到着では発行しない）
   * - 到着(`transitionend`)は `left`/`top` で二重に通知されるため、1 回の停止で\
   *   2 回発行されうる
   */
  'HexStage-move-stop': {
    /** 対象 actor */
    actorId: Actor['id']
  }
}

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

import { HexCell } from '../_lib/hex'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `Stage07-`
 * - `Stage07` が actor の状態変化を通知する。find-path 固有の概念は持たない
 */
export type Stage07EventMap = {
  /**
   * actor の描画位置がセル中心に到達した
   *
   * - `Stage07-move-start` は進入開始時のため、見た目上の到達はこちらで知る
   * - 中心の一定範囲内に入った時点、または判定時に中心を過ぎていた時点で発行する\
   *   （`judgeCellReach`）。同じセルでは 1 回のみ
   * - 静止中の現在セル（マウント時・停止時）にも発行する
   */
  'Stage07-cell-reach': {
    /** 対象 actor */
    actorId: ActorId
    /** 到達したセル */
    cell: HexCell
  }
  /** actor がセル間の移動を開始した（自動移動では 1 マスごとに発行する） */
  'Stage07-move-start': {
    /** 対象 actor */
    actorId: ActorId
  }
  /**
   * actor の移動が止まった
   *
   * - 隣接クリックでの移動は到着時、`followPath` による自動移動は終了時に発行する\
   *   （自動移動の途中の到着では発行しない）
   * - 到着(`transitionend`)は `left`/`top` で二重に通知されるため、1 回の停止で\
   *   2 回発行されうる
   */
  'Stage07-move-stop': {
    /** 対象 actor */
    actorId: ActorId
  }
}

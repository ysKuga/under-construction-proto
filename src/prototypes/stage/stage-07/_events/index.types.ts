import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `Stage07-`
 * - `Stage07` が actor の状態変化を通知する。find-path 固有の概念は持たない
 */
export type Stage07EventMap = {
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

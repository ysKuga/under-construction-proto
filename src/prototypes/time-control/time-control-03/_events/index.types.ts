import { ActorId } from '../types'

/**
 * イベント名 → payload 型の対応表
 */
export type TimeControl03EventMap = {
  /** 対象 actor 一括の行動決定実行 */
  'dispatch-decision': { actorIds: ActorId[] }
  /** 全 store (状態を持たない intent-store 以外) を初期状態に戻す */
  'reset-all': undefined
}

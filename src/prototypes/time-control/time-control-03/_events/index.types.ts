import { ActorId } from '../types'

/**
 * イベント名 → payload 型の対応表
 */
export type TimeControl03EventMap = {
  /** async listener 実演用サンプル (store 未使用、listener 内で Promise + setTimeout 完結) */
  'async-sample': undefined
  /** 対象 actor 一括の行動決定実行 */
  'dispatch-decision': undefined
  /** actor 個別の target 企図実行 (現在位置からランダムオフセット) */
  'dispatch-target': { actorId: ActorId }
  /** 全 store (状態を持たない intent-store 以外) を初期状態に戻す */
  'reset-all': undefined
  /** actor 個別の固定 step 数設定 */
  'set-fixed-path-steps': { actorId: ActorId; steps: number }
  /** actor 個別の固定 step 有効切替 */
  'set-is-fixed-path-steps': { actorId: ActorId; checked: boolean }
  /** 対象 actor 一括の進行モード(auto/manual) 切替 */
  'toggle-progress-mode': undefined
}

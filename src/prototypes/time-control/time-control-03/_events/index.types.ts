import { ActorId } from '../types'

/**
 * イベント名 → payload 型の対応表
 *
 * - key prefix: `TimeControl03-`
 */
export type TimeControl03EventMap = {
  /** async listener 実演用サンプル (store 未使用、listener 内で Promise + setTimeout 完結) */
  'TimeControl03-async-sample': undefined
  /** 対象 actor 一括の行動決定実行 */
  'TimeControl03-dispatch-decision': undefined
  /** actor 個別の target 企図実行 (現在位置からランダムオフセット) */
  'TimeControl03-dispatch-target': { actorId: ActorId }
  /** 対象 actor 一括の target 企図実行 (現在位置からランダムオフセット) */
  'TimeControl03-dispatch-target-all': undefined
  /** 全 store (状態を持たない intent-store 以外) を初期状態に戻す */
  'TimeControl03-reset-all': undefined
  /** actor 個別の固定 step 数設定 */
  'TimeControl03-set-fixed-path-steps': { actorId: ActorId; steps: number }
  /** 対象 actor 一括の固定 step 数設定 */
  'TimeControl03-set-fixed-path-steps-all': { steps: number }
  /** actor 個別の固定 step 有効切替 */
  'TimeControl03-set-is-fixed-path-steps': {
    actorId: ActorId
    checked: boolean
  }
  /** 対象 actor 一括の固定 step 有効切替 */
  'TimeControl03-set-is-fixed-path-steps-all': { checked: boolean }
  /** actor 個別の tick 時間設定 */
  'TimeControl03-set-tick-ms': { actorId: ActorId; tickMs: number }
  /** 実時間に対するゲーム内時間の進行倍率設定 (0 でポーズ相当) */
  'TimeControl03-set-time-scale': { timeScale: number }
  /** 対象 actor 一括の進行モード(auto/manual) 切替 */
  'TimeControl03-toggle-progress-mode': undefined
}

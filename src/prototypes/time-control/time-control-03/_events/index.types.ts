/**
 * イベント名 → payload 型の対応表
 */
export type TimeControl03EventMap = {
  /** async listener 実演用サンプル (store 未使用、listener 内で Promise + setTimeout 完結) */
  'async-sample': undefined
  /** 対象 actor 一括の行動決定実行 */
  'dispatch-decision': undefined
  /** 全 store (状態を持たない intent-store 以外) を初期状態に戻す */
  'reset-all': undefined
  /** 対象 actor 一括の進行モード(auto/manual) 切替 */
  'toggle-progress-mode': undefined
}

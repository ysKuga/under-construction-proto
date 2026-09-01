/** hopping action の発火イベント名 (外部 dispatch から連続ジャンプを on/off トグル) */
export const ACTION_HOPPING = 'BoxBot-action-hopping'

/** 待機演出 (連続ジャンプ) の設定 */
export type HoppingConfig = {
  /** ジャンプ 1 回ごとの間隔 (秒)。前回の dispatch からこの秒数で次を撃つ */
  intervalSec: number
}

/** `host.config`(hopping)の既定値。`actionConfig.hopping` で部分上書きできる */
export const HOPPING_DEFAULTS: HoppingConfig = { intervalSec: 2.5 }

/** fall action の発火イベント名 (クリック起点・外部 dispatch 共通) */
export const ACTION_FALL = 'BoxBot-action-fall'

/** 転倒 (直立 → 前傾) の継続時間 (秒) */
export const FALL_DUR = 0.4

/** 起き上がり (横倒し → 直立) の継続時間 (秒) */
export const GET_UP_DUR = 0.6

/** 倒れきった状態の前傾角度 (rad、シルエット中心まわりの x 軸回転) */
export const FALL_ANGLE = Math.PI / 2

/**
 * 転倒中に腕を頭の近くへ引き寄せる角度 (rad、x 軸回転)
 *
 * - fall 発火時に即座に切替える (経過時間による補間はしない)。頭をかばう動きを意図
 * - get-up は体の起き上がりと同じ進行度でこの角度から 0 (垂直) へ戻す
 * - 将来この動き自体を独立 action (軌道) にする際に見直す想定
 */
export const FALL_ARM_ANGLE = (-3 * Math.PI) / 4

/**
 * 転倒の見た目を合わせるための表示領域ずらし量 (px)
 *
 * - Canvas 内ではシルエット中心まわりに回すだけ。足元が前方へ出た「倒れ込み」の見た目は、
 *   表示領域 (Canvas ラッパー) を DOM でずらして表現する (#108 フェーズ1、jump と同じ機構)
 * - 横は倒れ始めの facing (bot の向き) をカメラ投影した画面横成分、縦は facing 非依存の下げ量
 * - 転倒進行度に同期してこの距離まで補間し、get-up で 0 へ戻す
 */
export type FallConfig = {
  /**
   * 横倒し時に画面下へ下げる量 (px、実測要)
   *
   * - シルエット中心まわりに回すため、横倒しでは足元が立ち姿勢の接地点より上に浮く。
   *   その浮きを打ち消し、足元を立ち姿勢の高さあたりへ戻すための下げ量
   * - facing 非依存。転倒進行度に同期してこの量まで補間し、get-up で 0 へ戻す
   */
  dropDistance: number
  /**
   * 倒れ込みで横へずらす距離 (px)
   *
   * - 倒れ始めの facing をカメラ投影した画面横成分に掛ける。前後向き (正面/背面) は ≈ 0、
   *   真横向きで最大。縦方向のずれは持たない (足元の縦位置は `dropDistance` 一本で合わせる)
   */
  shiftDistance: number
}

/**
 * 転倒 1 回ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().fall(...)`)時に指定する
 * - 省略したキーは `host.config`(`FALL_DEFAULTS` ← `actionConfig.fall` 上書き)の値を使う
 * - 直立 → 転倒の起動時のみ反映。get-up 側は起動時の値をそのまま逆再生する
 */
export type FallOverride = Partial<FallConfig>

/** `host.config`(fall)の既定値。`actionConfig.fall` で部分上書きできる */
export const FALL_DEFAULTS: FallConfig = {
  dropDistance: 60,
  shiftDistance: 80,
}

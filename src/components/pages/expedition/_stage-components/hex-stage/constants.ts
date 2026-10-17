import { CSSProperties } from 'react'

/**
 * 値調整スライダーの label スタイル
 *
 * - 1 要素 1 行にし、見出し | バー | 値 の列を全 label で同じ幅に揃える
 * - `Stage07` の `extraSliders` へ差し込むスライダーも同じ列幅に揃えるため export する
 */
export const SLIDER_LABEL_STYLE: CSSProperties = {
  alignItems: 'center',
  columnGap: 8,
  display: 'grid',
  gridTemplateColumns: '10em 160px auto',
}

/**
 * 移動・歩行の調整値の既定値
 *
 * - `Stage07` の props 省略時の値。呼び出し元が調整値を持つ場合の初期値にも使う
 */
export const MOTION_DEFAULTS = {
  /**
   * 歩行中の体の上下(body-bobbing)の最大持ち上げ量(world)
   *
   * - `BODY_BOBBING_DEFAULTS.height`(0.025)は Canvas 一辺 234px 基準。stage 上の小さい bot
   *   (56px 程度)では 1px 未満になり視認できないため、大きめにする
   */
  bodyBobHeight: 0.1,
  /** walking の脚振り角の振幅(rad)。`WALKING_DEFAULTS.swingAngle` と同じ */
  legSwingAngle: 0.5,
  /** walking の脚振り周期(`cycleSec`)の上限(秒) */
  maxWalkCycleSec: 1.2,
  /** セル間移動アニメーションの所要時間(ms) */
  moveDurationMs: 300,
} as const

/** 操作対象 actor の id (単一 actor) */
export const PLAYER_ACTOR_ID = 'player'

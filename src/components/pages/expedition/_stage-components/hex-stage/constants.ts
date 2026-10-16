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

/** 操作対象 actor の id (単一 actor) */
export const PLAYER_ACTOR_ID = 'player'

/**
 * 隣接 1 マス (直進) の移動 transition 基準時間 (ms)
 *
 * - 斜め移動は距離 (√2 倍) に比例して actor-node-registry がこの値から算出する。
 *   移動距離に依らず見た目の速度を一定にするため
 */
export const CELL_TRANSITION_MS = 150

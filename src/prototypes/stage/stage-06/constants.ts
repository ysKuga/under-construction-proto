/** 操作対象 actor の id (stage-06 は単一 actor) */
export const PLAYER_ACTOR_ID = 'player'

/**
 * 隣接 1 マス (直進) の移動 transition 基準時間 (ms)
 *
 * - 斜め移動は距離 (√2 倍) に比例して actor-node-registry がこの値から算出する。
 *   移動距離に依らず見た目の速度を一定にするため
 */
export const CELL_TRANSITION_MS = 150

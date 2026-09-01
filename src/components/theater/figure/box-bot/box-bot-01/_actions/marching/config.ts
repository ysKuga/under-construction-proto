/** marching action の発火イベント名 (外部 dispatch から足踏みを on/off トグル) */
export const ACTION_MARCHING = 'BoxBot-action-marching'

/** 足踏み(脚の上下 bob)の設定 */
export type MarchingConfig = {
  /** 脚の上下オフセットの振幅 (world、付け根の position.y) */
  bobHeight: number
  /** 左右 1 往復の周期 (秒) */
  cycleSec: number
  /** 停止後にオフセットを 0 へ戻す速さ (approach の減衰係数) */
  settleRate: number
}

/** `host.config`(marching)の既定値。`actionConfig.marching` で部分上書きできる */
export const MARCHING_DEFAULTS: MarchingConfig = {
  bobHeight: 0.12,
  cycleSec: 1,
  settleRate: 10,
}

import { StoreApi } from 'zustand/vanilla'

/**
 * player の行為
 *
 * - `idle`: 停止中。停止中前提の操作（EN スポットの使用等）を受け付ける
 * - `moving`: 移動中（隣接移動・自動移動とも）
 * - `recovering`: EN スポットで補給中。完了まで他の操作を受け付けない
 * - 移動・補給とも時間経過を必要とする行為として同列に扱う（issue #297）
 */
export type PlayerActivity = 'idle' | 'moving' | 'recovering'

/** player の行為を保持する store */
export type PlayerActivityState = {
  /** 現在の行為 */
  activity: PlayerActivity
  /**
   * 行為を切り替える
   *
   * @param activity 切替先の行為
   */
  setActivity: (activity: PlayerActivity) => void
}

export type PlayerActivityStore = StoreApi<PlayerActivityState>

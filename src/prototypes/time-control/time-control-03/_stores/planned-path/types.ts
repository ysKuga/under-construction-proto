import { StoreApi } from 'zustand/vanilla'

import { ActorId, MovePath, Position } from '../../types'

/**
 * actor ごとの「予定位置」表示専用の経路を保持する store
 *
 * - `path-store` (行動決定が消費する実行用の残り経路) とは別に持つ。\
 *   `set target` (企図) 時のみ更新され、行動決定では一切変更されない\
 *   (`PlannedPathMarker` が行動決定で再レンダリングされないようにするため)
 */
export type PlannedPathState = {
  /** actor の予定経路を取得する (未設定時はデフォルト値を返す) */
  getPlannedPath: (actorId: ActorId) => MovePath
  /**
   * 対象 actor 全員の目標地点 (予定経路の終点) を取得する
   *
   * - 未企図 actor (予定経路が空) は `DEFAULT_POSITION` で補う
   *
   * @param actorIds 対象 actor 一覧
   */
  getTargets: (actorIds: ActorId[]) => Position[]
  /** actor ごとの予定経路 (表示専用) */
  plannedPathById: Record<ActorId, MovePath>
  /** 予定経路を初期状態に戻す */
  reset: () => void
  /** actor の予定経路を置き換える */
  setPlannedPath: (actorId: ActorId, path: MovePath) => void
}

export type PlannedPathStore = StoreApi<PlannedPathState>

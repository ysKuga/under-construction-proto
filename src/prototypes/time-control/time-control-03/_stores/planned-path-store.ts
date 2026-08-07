import { createStore, StoreApi } from 'zustand/vanilla'

import { ActorId, MovePath } from '../types'

/**
 * actor ごとの「予定位置」表示専用の経路を保持する store
 *
 * - `path-store` (行動決定が消費する実行用の残り経路) とは別に持つ。\
 *   `set target` (企図) 時のみ更新され、行動決定では一切変更されない\
 *   (`PlannedPathMarker` が行動決定で再レンダリングされないようにするため)
 */
export type PlannedPathState = {
  /** actor ごとの予定経路 (表示専用) */
  plannedPathById: Record<ActorId, MovePath>
  /** 予定経路を初期状態に戻す */
  reset: () => void
  /** actor の予定経路を置き換える */
  setPlannedPath: (actorId: ActorId, path: MovePath) => void
}

export type PlannedPathStore = StoreApi<PlannedPathState>

const INITIAL_STATE = {
  plannedPathById: {},
} satisfies Partial<PlannedPathState>

export const createPlannedPathStore = (): PlannedPathStore =>
  createStore<PlannedPathState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setPlannedPath: (actorId, path) => {
      set((state) => ({
        plannedPathById: { ...state.plannedPathById, [actorId]: path },
      }))
    },
  }))

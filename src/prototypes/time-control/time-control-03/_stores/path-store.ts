import { createStore, StoreApi } from 'zustand/vanilla'

import { ActorId, MovePath } from '../types'

/**
 * actor ごとの残り移動経路のみを保持する store
 *
 * - 経路の生成 (企図) は intent-store、経路の消化 (行動決定) は position-store が\
 *   それぞれ本 store を経由して読み書きする
 */
export type PathState = {
  /** actor ごとの残り移動経路 */
  pathById: Record<ActorId, MovePath>
  /** 経路を初期状態に戻す */
  reset: () => void
  /** actor の残り移動経路を置き換える */
  setPath: (actorId: ActorId, path: MovePath) => void
}

export type PathStore = StoreApi<PathState>

/** 未行動 actor のデフォルト経路 (固定参照、selector の再レンダリング抑制用) */
export const DEFAULT_PATH: MovePath = []

const INITIAL_STATE = {
  pathById: {},
} satisfies Partial<PathState>

export const createPathStore = (): PathStore =>
  createStore<PathState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setPath: (actorId, path) => {
      set((state) => ({
        pathById: { ...state.pathById, [actorId]: path },
      }))
    },
  }))

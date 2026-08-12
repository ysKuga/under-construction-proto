import { createStore, StoreApi } from 'zustand/vanilla'

import { ActorId, ProgressMode } from '../../types'

/** actor ごとの操作設定 (経路の step 数指定・行動進行モード) */
export type ActorSettings = {
  /** 固定 step 数。`isFixedPathSteps` が true の時のみ使用する */
  fixedPathSteps: number
  /** 経路の step 数を固定するか。false ならランダム (距離ベース自動計算) */
  isFixedPathSteps: boolean
  /** 行動進行モード */
  progressMode: ProgressMode
}

/**
 * actor の操作設定 (経路の step 数指定・行動進行モード) のみを保持する store
 *
 * - 移動速度・tick 発生頻度は actor の実装に直接関係するため `_stores/actor/store.ts` に分離
 */
export type ActorSettingsState = {
  /** 操作設定を初期状態に戻す */
  reset: () => void
  /** 固定 step 数を設定する (`isFixedPathSteps` が true の時のみ意味を持つ) */
  setFixedPathSteps: (actorId: ActorId, steps: number) => void
  /** 経路の step 数を固定するかどうかを設定する */
  setIsFixedPathSteps: (actorId: ActorId, isFixed: boolean) => void
  /** 行動進行モードを設定する */
  setProgressMode: (actorId: ActorId, mode: ProgressMode) => void
  /** actor ごとの操作設定 */
  settingsById: Record<ActorId, ActorSettings>
}

export type ActorSettingsStore = StoreApi<ActorSettingsState>

/** 操作設定未設定 actor のデフォルト値 */
export const DEFAULT_ACTOR_SETTINGS: ActorSettings = {
  fixedPathSteps: 1,
  isFixedPathSteps: false,
  progressMode: 'auto',
}

const INITIAL_STATE = {
  settingsById: {},
} satisfies Partial<ActorSettingsState>

export const createActorSettingsStore = (): ActorSettingsStore =>
  createStore<ActorSettingsState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setFixedPathSteps: (actorId, steps) => {
      set((state) => ({
        settingsById: {
          ...state.settingsById,
          [actorId]: {
            ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
            fixedPathSteps: steps,
          },
        },
      }))
    },
    setIsFixedPathSteps: (actorId, isFixed) => {
      set((state) => ({
        settingsById: {
          ...state.settingsById,
          [actorId]: {
            ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
            isFixedPathSteps: isFixed,
          },
        },
      }))
    },
    setProgressMode: (actorId, mode) => {
      set((state) => ({
        settingsById: {
          ...state.settingsById,
          [actorId]: {
            ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
            progressMode: mode,
          },
        },
      }))
    },
  }))

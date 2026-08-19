import { StoreApi } from 'zustand/vanilla'

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
  /** actor ごとの操作設定を取得する (未設定時はデフォルト値を返す) */
  getActorSettings: (actorId: ActorId) => ActorSettings
  /** 操作設定を初期状態に戻す */
  reset: () => void
  /** 固定 step 数を設定する (`isFixedPathSteps` が true の時のみ意味を持つ) */
  setFixedPathSteps: (actorId: ActorId, steps: number) => void
  /** 対象 actor 全員の固定 step 数を一括設定する */
  setFixedPathStepsAll: (actorIds: ActorId[], steps: number) => void
  /** 経路の step 数を固定するかどうかを設定する */
  setIsFixedPathSteps: (actorId: ActorId, isFixed: boolean) => void
  /** 対象 actor 全員の固定 step 有効/無効を一括設定する */
  setIsFixedPathStepsAll: (actorIds: ActorId[], isFixed: boolean) => void
  /** 行動進行モードを設定する */
  setProgressMode: (actorId: ActorId, mode: ProgressMode) => void
  /** actor ごとの操作設定 */
  settingsById: Record<ActorId, ActorSettings>
  /**
   * 対象 actor 全員の行動進行モードを一括反転する
   *
   * - 現在値は先頭 actor の設定を代表値として判定する
   */
  toggleProgressMode: (actorIds: ActorId[]) => void
}

export type ActorSettingsStore = StoreApi<ActorSettingsState>

import { createStore, StoreApi } from 'zustand/vanilla'

import { BASE_TICK_MS } from '../../time-control-02/_lib/get-tick-ms'
import { ActorId } from '../types'

/**
 * actor の実装 (移動速度・tick 発生頻度) に直接関係する情報
 *
 * - フィールドごとに `Record<ActorId, T>` を分けず、actor 単位でオブジェクトに\
 *   まとめる (拡張性のため。フィールド追加時に新しい `xxxById` を増やさずに済む)
 */
export type ActorInfo = {
  /** 移動速度 (距離/ms) */
  speed: number
  /** tick 発生頻度。画面表示用の「敏捷性」とは別名にしている (未確定の変換式) */
  tickRate: number
}

/**
 * actor の実装に直接関係する情報のみを保持する store
 *
 * - 経路の最低 step 数・行動進行モードは `_stores/actor-settings-store.ts` に分離
 * - position・経路・企図のロジックは持たない (それぞれ position-store/path-store/\
 *   intent-store に分離済み)
 * - `actorById` は自身の actor id のみを鍵にした selector で購読すれば、\
 *   他 actor の値変化では再レンダリングされない (02 の `xxxById` パターンを踏襲、\
 *   命名は単数形 + `ById` で既存フィールドと揃える)
 * - Record を採用 (Map は ActorId=string 固定のため任意キー型の利点が活きず、\
 *   スプレッド構文でのイミュータブル更新のしやすさを優先)
 */
export type ActorState = {
  /** actor ごとの情報 */
  actorById: Record<ActorId, ActorInfo>
  /** actor の情報を初期状態に戻す */
  reset: () => void
  /**
   * actor の tickMs (tick の実時間長) を設定する
   *
   * - 内部では `tickRate = BASE_TICK_MS / tickMs` に変換して保持する\
   *   (`ActorInfo` は tickRate のみを持つため)
   *
   * @param actorId 対象 actor
   * @param tickMs tick の実時間長 (ms)
   */
  setTickMs: (actorId: ActorId, tickMs: number) => void
}

export type ActorStore = StoreApi<ActorState>

/** actor の情報未設定時のデフォルト値 */
export const DEFAULT_ACTOR_INFO: ActorInfo = {
  speed: 0.01,
  tickRate: 2,
}

const INITIAL_STATE = {
  actorById: {},
} satisfies Partial<ActorState>

export const createActorStore = (): ActorStore =>
  createStore<ActorState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setTickMs: (actorId, tickMs) => {
      set((state) => ({
        actorById: {
          ...state.actorById,
          [actorId]: {
            ...(state.actorById[actorId] ?? DEFAULT_ACTOR_INFO),
            tickRate: BASE_TICK_MS / tickMs,
          },
        },
      }))
    },
  }))

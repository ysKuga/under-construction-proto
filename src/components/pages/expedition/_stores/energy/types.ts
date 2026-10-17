import { StoreApi } from 'zustand/vanilla'

import { Actor } from '@/types/theater/actor'

/**
 * actor のエネルギー関連情報
 *
 * - フィールドごとに `Record<Actor['id'], T>` を分けず、actor 単位でオブジェクトに\
 *   まとめる（tc-03 の `ActorInfo` と同じ方針。拡張性のため）
 */
export type EnergyInfo = {
  /** 現在のエネルギー残量 */
  current: number
  /** エネルギー上限 */
  max: number
}

/**
 * actor ごとのエネルギー残量を保持する store
 */
export type EnergyState = {
  /** エネルギーを消費する（0 未満にはならない） */
  consume: (actorId: Actor['id'], amount: number) => void
  /** actor ごとのエネルギー情報 */
  energyById: Record<Actor['id'], EnergyInfo>
  /** actor のエネルギー情報を取得する（未設定時はデフォルト値を返す） */
  getEnergyInfo: (actorId: Actor['id']) => EnergyInfo
  /** エネルギーを補給する（上限を超えない） */
  charge: (actorId: Actor['id'], amount: number) => void
  /** エネルギーを初期状態に戻す */
  reset: () => void
}

export type EnergyStore = StoreApi<EnergyState>

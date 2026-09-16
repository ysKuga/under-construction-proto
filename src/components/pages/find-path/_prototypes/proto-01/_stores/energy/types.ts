import { StoreApi } from 'zustand/vanilla'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/**
 * actor のエネルギー関連情報
 *
 * - フィールドごとに `Record<ActorId, T>` を分けず、actor 単位でオブジェクトに\
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
 *
 * - 回復（アイテム/スポット）ロジックは別 PR。ここは保持・消費のみ
 */
export type EnergyState = {
  /** エネルギーを消費する（0 未満にはならない） */
  consume: (actorId: ActorId, amount: number) => void
  /** actor ごとのエネルギー情報 */
  energyById: Record<ActorId, EnergyInfo>
  /** actor のエネルギー情報を取得する（未設定時はデフォルト値を返す） */
  getEnergyInfo: (actorId: ActorId) => EnergyInfo
  /** エネルギーを初期状態に戻す */
  reset: () => void
}

export type EnergyStore = StoreApi<EnergyState>

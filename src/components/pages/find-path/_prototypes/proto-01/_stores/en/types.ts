import { StoreApi } from 'zustand/vanilla'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'

/**
 * actor の EN（エネルギー）関連情報
 *
 * - フィールドごとに `Record<ActorId, T>` を分けず、actor 単位でオブジェクトに\
 *   まとめる（tc-03 の `ActorInfo` と同じ方針。拡張性のため）
 */
export type EnInfo = {
  /** 現在の EN 残量 */
  current: number
  /** EN 上限 */
  max: number
}

/**
 * actor ごとの EN（エネルギー）残量を保持する store
 *
 * - 回復（アイテム/スポット）ロジックは別 PR。ここは保持・消費のみ
 */
export type EnState = {
  /** EN を消費する（0 未満にはならない） */
  consume: (actorId: ActorId, amount: number) => void
  /** actor ごとの EN 情報 */
  enById: Record<ActorId, EnInfo>
  /** actor の EN 情報を取得する（未設定時はデフォルト値を返す） */
  getEnInfo: (actorId: ActorId) => EnInfo
  /** EN を初期状態に戻す */
  reset: () => void
}

export type EnStore = StoreApi<EnState>

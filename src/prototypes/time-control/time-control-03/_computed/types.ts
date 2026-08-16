import { StoreApi } from 'zustand/vanilla'

import { ProgressMode } from '../types'

/**
 * props・store から算出する派生値のみを保持する store
 *
 * - `./store.ts` にて実装
 */
export type ComputedState = {
  /** 行動進行モード (全 actor 代表 (先頭) の値) */
  progressMode: ProgressMode
}

export type ComputedStore = StoreApi<ComputedState>

import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { GameClockState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<GameClockState>('GameClock')

/** GameClock store 用 Context */
export const GameClockStoreContext = StoreContext

/** GameClock store を selector 購読する */
export const useGameClockStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - tick ドライバ等、selector を経由せず `getState()` / `logEvent` / `subscribe` を\
 *   直接叩く用途向け
 */
export const useGameClockStoreApi = (): StoreApi<GameClockState> =>
  useStoreApi()

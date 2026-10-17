import { createStore } from 'zustand/vanilla'

import { CarriedItemState, CarriedItemStore } from './types'

/**
 * 携行中アイテム store を生成する
 *
 * @param capacity 携行可能な上限数
 */
export const createCarriedItemStore = (capacity: number): CarriedItemStore =>
  createStore<CarriedItemState>((set, get) => ({
    capacity,
    carriedItems: [],
    pickUp: (item) => {
      if (get().carriedItems.length >= get().capacity) {
        return false
      }

      set((state) => ({ carriedItems: [...state.carriedItems, item] }))

      return true
    },
    reset: () => {
      set({ carriedItems: [] })
    },
    useItem: () => {
      const [oldest, ...rest] = get().carriedItems

      if (!oldest) {
        return undefined
      }

      set({ carriedItems: rest })

      return oldest
    },
  }))

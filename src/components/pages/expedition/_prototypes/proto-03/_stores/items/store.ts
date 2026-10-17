import { createStore } from 'zustand/vanilla'

import { ItemInstance, ItemState, ItemStore } from './types'

/** id → ItemInstance の Record を組み立てる */
const toItemsById = (items: ItemInstance[]): Record<string, ItemInstance> =>
  Object.fromEntries(items.map((item) => [item.id, item]))

/**
 * グリッド上のアイテム store を生成する
 *
 * @param initialItems 初期配置するアイテム一覧
 */
export const createItemStore = (initialItems: ItemInstance[]): ItemStore => {
  const initialState = { itemsById: toItemsById(initialItems) }

  return createStore<ItemState>((set, get) => ({
    ...initialState,
    consumeItem: (id) => {
      const item = get().itemsById[id]

      if (!item) {
        return undefined
      }

      if (item.stock === undefined) {
        set((state) => ({
          itemsById: Object.fromEntries(
            Object.entries(state.itemsById).filter(([key]) => key !== id),
          ),
        }))

        return item
      }

      if (item.stock <= 0) {
        return undefined
      }

      const consumed = { ...item, stock: item.stock - 1 }

      set((state) => ({
        itemsById: { ...state.itemsById, [id]: consumed },
      }))

      return consumed
    },
    getItemAtCell: (cell) =>
      Object.values(get().itemsById).find(
        (item) =>
          item.cell.q === cell.q &&
          item.cell.r === cell.r &&
          (item.stock === undefined || item.stock > 0),
      ),
    reset: () => {
      set(initialState)
    },
  }))
}

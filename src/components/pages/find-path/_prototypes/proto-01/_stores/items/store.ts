import { createStore } from 'zustand/vanilla'

import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { ItemInstance, ItemState, ItemStore } from './types'

/** id → ItemInstance の Record を組み立てる */
const toItemsById = (items: ItemInstance[]): Record<string, ItemInstance> =>
  Object.fromEntries(items.map((item) => [item.id, item]))

/** a と b が同じセルか */
const isSameCell = (a: GridPosition, b: GridPosition) =>
  a.col === b.col && a.row === b.row

/**
 * グリッド上のアイテム・障害物 store を生成する
 *
 * @param initialItems 初期配置するアイテム一覧
 * @param obstacleCells 障害物セル一覧（通行不可、静的）
 */
export const createItemStore = (
  initialItems: ItemInstance[],
  obstacleCells: GridPosition[],
): ItemStore => {
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
    getContentsAtCell: (cell) => {
      const contents: ReturnType<ItemState['getContentsAtCell']> = []

      if (get().obstacleCells.some((obstacle) => isSameCell(obstacle, cell))) {
        contents.push({ kind: 'obstacle' })
      }

      const item = get().getItemAtCell(cell)

      if (item) {
        contents.push({ item, kind: 'item' })
      }

      return contents
    },
    getItemAtCell: (cell) =>
      Object.values(get().itemsById).find(
        (item) =>
          item.cell.col === cell.col &&
          item.cell.row === cell.row &&
          (item.stock === undefined || item.stock > 0),
      ),
    obstacleCells,
    reset: () => {
      set(initialState)
    },
  }))
}

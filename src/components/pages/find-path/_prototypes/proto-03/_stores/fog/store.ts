import { createStore } from 'zustand/vanilla'

import { HEX_DIRECTIONS, HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { FogState, FogStore, FogStoreOptions } from './types'

/** セルキー ("q,r") を組み立てる */
const cellKey = (cell: HexCell): string => `${cell.q},${cell.r}`

/** cell 自身とその6近傍（視界）を列挙する */
const visibleAreaOf = (cell: HexCell): HexCell[] => [
  cell,
  ...HEX_DIRECTIONS.map((direction) => ({
    q: cell.q + direction.q,
    r: cell.r + direction.r,
  })),
]

/**
 * 霧の store を生成する
 *
 * @param options 生成オプション
 */
export const createFogStore = (options: FogStoreOptions): FogStore => {
  const { initialMode, partialFogCells, startCell } = options

  const partialFogKeys = new Set(partialFogCells.map(cellKey))

  return createStore<FogState>((set, get) => ({
    currentCell: startCell,
    isVisible: (cell) => {
      const { currentCell, mode, showVisited, visitedKeys } = get()
      const key = cellKey(cell)

      if (
        mode === 'all-visible' ||
        (mode === 'partial' && !partialFogKeys.has(key))
      ) {
        return true
      }

      if (visibleAreaOf(currentCell).some((area) => cellKey(area) === key)) {
        return true
      }

      return showVisited && visitedKeys.has(key)
    },
    markVisited: (cell) => {
      set((state) => ({
        currentCell: cell,
        visitedKeys: new Set([
          ...state.visitedKeys,
          ...visibleAreaOf(cell).map(cellKey),
        ]),
      }))
    },
    mode: initialMode,
    setMode: (mode) => {
      set({ mode })
    },
    setShowVisited: (showVisited) => {
      set({ showVisited })
    },
    showVisited: true,
    visitedKeys: new Set(visibleAreaOf(startCell).map(cellKey)),
  }))
}

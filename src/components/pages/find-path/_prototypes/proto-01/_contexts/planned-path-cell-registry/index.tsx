'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

/** グリッド上のセル座標 (0-indexed) */
type Cell = {
  /** 列 */
  col: number
  /** 行 */
  row: number
}

/** セルキー ("col-row") を組み立てる */
const cellKey = (cell: Cell): string => `${cell.col}-${cell.row}`

type PlannedPathCellRegistryValue = {
  /**
   * セルを CSS transition でフェードアウトする
   *
   * - `style.opacity` を直書きするのみ。React state を持たないため、\
   *   この呼出で購読側は再レンダリングされない
   */
  fadeOutCell: (cell: Cell) => void
  /**
   * 予定経路セルの DOM を登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   */
  registerCellNode: (cell: Cell, el: HTMLElement | null) => void
  /**
   * 登録済みの全セルを再表示する
   *
   * - 予定経路の一括クリア（歩き切り・実行完了）時に呼ぶ。`resetCell` と同じ理由で\
   *   `setPlannedPath([])` の再レンダリングだけでは fadeOutCell 済みセルが戻らない
   */
  resetAllCells: () => void
  /**
   * `fadeOutCell` で消したセルを再表示する
   *
   * - セルを再選択（`appendStep`）した際に呼ぶ。React の style diffing は\
   *   直書きした DOM の実値でなく前回渡した props（`opacity: 1` のまま変化なし）を\
   *   見るため、再レンダリングだけでは opacity: 0 が戻らない
   */
  resetCell: (cell: Cell) => void
}

const PlannedPathCellRegistryContext =
  createContext<null | PlannedPathCellRegistryValue>(null)

/**
 * 予定経路セルの DOM を ref で保持し、到達済みセルのフェードアウトを DOM 直書きで反映する Provider
 *
 * - `useState` を持たず、フェードアウトしても配下は再レンダリングしない
 *   (`ActorNodeRegistryProvider` と同じ狙い)
 * - 予定経路自体(表示するセル一覧)は `usePlannedPathStore` の React state のまま。\
 *   ここは到達済みセルの opacity のみを直書きする。React の style diffing は\
 *   直書きした DOM の実値でなく前回渡した props を見るため、`PlannedPathLayer` の\
 *   再レンダリングだけでは opacity: 0 が戻らない（`resetCell` / `resetAllCells` で\
 *   明示的に戻す）
 */
export const PlannedPathCellRegistryProvider = (props: PropsWithChildren) => {
  const { children } = props

  const nodesRef = useRef(new Map<string, HTMLElement>())

  const registerCellNode = useCallback((cell: Cell, el: HTMLElement | null) => {
    const key = cellKey(cell)

    if (el === null) {
      nodesRef.current.delete(key)

      return
    }

    nodesRef.current.set(key, el)
  }, [])

  const fadeOutCell = useCallback((cell: Cell) => {
    nodesRef.current.get(cellKey(cell))?.style.setProperty('opacity', '0')
  }, [])

  const resetCell = useCallback((cell: Cell) => {
    nodesRef.current.get(cellKey(cell))?.style.setProperty('opacity', '1')
  }, [])

  const resetAllCells = useCallback(() => {
    nodesRef.current.forEach((node) => {
      node.style.setProperty('opacity', '1')
    })
  }, [])

  const value = useMemo(
    () => ({ fadeOutCell, registerCellNode, resetAllCells, resetCell }),
    [fadeOutCell, registerCellNode, resetAllCells, resetCell],
  )

  return (
    <PlannedPathCellRegistryContext.Provider value={value}>
      {children}
    </PlannedPathCellRegistryContext.Provider>
  )
}

/** planned-path-cell-registry の API を取得する */
export const usePlannedPathCellRegistry = (): PlannedPathCellRegistryValue => {
  const context = useContext(PlannedPathCellRegistryContext)

  if (context === null) {
    throw new Error(
      'usePlannedPathCellRegistry should be used within <PlannedPathCellRegistryProvider>',
    )
  }

  return context
}

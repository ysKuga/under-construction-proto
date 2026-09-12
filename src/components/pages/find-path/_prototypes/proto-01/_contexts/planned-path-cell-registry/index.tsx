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
}

const PlannedPathCellRegistryContext =
  createContext<null | PlannedPathCellRegistryValue>(null)

/**
 * 予定経路セルの DOM を ref で保持し、到達済みセルのフェードアウトを DOM 直書きで反映する Provider
 *
 * - `useState` を持たず、フェードアウトしても配下は再レンダリングしない
 *   (`ActorNodeRegistryProvider` と同じ狙い)
 * - 予定経路自体(表示するセル一覧)は `usePlannedPathStore` の React state のまま。\
 *   ここは到達済みセルの opacity のみを直書きする。`PlannedPathLayer` が\
 *   再レンダリングされれば(1 手戻す・実行完了によるクリア等)通常どおり作り直される
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

  const value = useMemo(
    () => ({ fadeOutCell, registerCellNode }),
    [fadeOutCell, registerCellNode],
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

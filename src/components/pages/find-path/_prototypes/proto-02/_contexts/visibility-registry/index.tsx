'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

import { START_POSITION } from '../../constants'

/** グリッド上のセル座標 (0-indexed) */
type Cell = {
  /** 列 */
  col: number
  /** 行 */
  row: number
}

/** 表示切替対象 DOM の用途 */
type NodeKind = 'marker' | 'select'

/** セルキー ("col,row") を組み立てる */
const cellKey = (cell: Cell): string => `${cell.col},${cell.row}`

/** 2 セルが同一または隣接（斜め含む8方向）か */
const isAdjacentOrSame = (a: Cell, b: Cell): boolean =>
  Math.abs(a.col - b.col) <= 1 && Math.abs(a.row - b.row) <= 1

type VisibilityRegistryValue = {
  /** cell が表示可能（到達済み、または到達済みセルに隣接）か */
  isVisible: (cell: Cell) => boolean
  /**
   * cell への到達を記録する
   *
   * - 影響範囲（自セル + 8 近傍）の登録済み DOM を直書きで表示/非表示に切り替える。
   *   React state を持たないため、この呼出で購読側は再レンダリングされない
   */
  markVisited: (cell: Cell) => void
  /**
   * セルの表示切替対象 DOM を登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   * - `kind` ごとに別 DOM を持てる（`AdjacentMoveLayer` のセル選択 button = `select`、
   *   `GoalMarkerLayer`（proto-01 と共用）の旗表示 = `marker`）
   * - 登録時、その cell の現在の可視状態を DOM へ即反映する（再マウント復帰用）
   */
  registerVisibilityNode: (
    cell: Cell,
    kind: NodeKind,
    el: HTMLElement | null,
  ) => void
}

const VisibilityRegistryContext = createContext<null | VisibilityRegistryValue>(
  null,
)

/**
 * 到達済みセルを ref で保持し、可視状態を DOM 直書きで反映する Provider
 *
 * - `useState` を持たず、到達（`markVisited`）のたびに配下を再レンダリングしない
 *   (proto-01 `ActorNodeRegistryProvider` と同じ狙い)
 * - 可視判定は「到達済みセル自身、またはそこへ隣接（斜め含む8方向）」。未到達かつ
 *   非隣接のセルは非表示（`display: none`）にし、ボタン等のクリックも自然に不可になる
 * - 初期到達済みセルは bot の初期セル `START_POSITION` に固定（proto-02 は
 *   `ActorNodeRegistryProvider` の `initialPosition` も同じ値を渡している）
 */
export const VisibilityRegistryProvider = (props: PropsWithChildren) => {
  const { children } = props

  const visitedRef = useRef(new Set([cellKey(START_POSITION)]))
  const nodesRef = useRef(new Map<string, Map<NodeKind, HTMLElement>>())

  const isVisible = useCallback((cell: Cell): boolean => {
    for (const key of visitedRef.current) {
      const [col, row] = key.split(',').map(Number)

      if (isAdjacentOrSame(cell, { col, row })) {
        return true
      }
    }

    return false
  }, [])

  const applyVisibility = useCallback(
    (cell: Cell) => {
      const nodes = nodesRef.current.get(cellKey(cell))

      if (!nodes) {
        return
      }

      const display = isVisible(cell) ? '' : 'none'

      nodes.forEach((node) => {
        node.style.display = display
      })
    },
    [isVisible],
  )

  const registerVisibilityNode = useCallback(
    (cell: Cell, kind: NodeKind, el: HTMLElement | null) => {
      const key = cellKey(cell)
      const kinds =
        nodesRef.current.get(key) ?? new Map<NodeKind, HTMLElement>()

      if (el === null) {
        kinds.delete(kind)
      } else {
        kinds.set(kind, el)
      }

      if (kinds.size === 0) {
        nodesRef.current.delete(key)

        return
      }

      nodesRef.current.set(key, kinds)
      applyVisibility(cell)
    },
    [applyVisibility],
  )

  const markVisited = useCallback(
    (cell: Cell) => {
      visitedRef.current.add(cellKey(cell))

      for (let dRow = -1; dRow <= 1; dRow += 1) {
        for (let dCol = -1; dCol <= 1; dCol += 1) {
          applyVisibility({ col: cell.col + dCol, row: cell.row + dRow })
        }
      }
    },
    [applyVisibility],
  )

  const value = useMemo(
    () => ({ isVisible, markVisited, registerVisibilityNode }),
    [isVisible, markVisited, registerVisibilityNode],
  )

  return (
    <VisibilityRegistryContext.Provider value={value}>
      {children}
    </VisibilityRegistryContext.Provider>
  )
}

/** visibility-registry の API を取得する */
export const useVisibilityRegistry = (): VisibilityRegistryValue => {
  const context = useContext(VisibilityRegistryContext)

  if (context === null) {
    throw new Error(
      'useVisibilityRegistry should be used within <VisibilityRegistryProvider>',
    )
  }

  return context
}

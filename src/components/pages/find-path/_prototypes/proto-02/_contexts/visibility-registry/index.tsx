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
type NodeKind = 'floor' | 'marker' | 'select'

/** セルキー ("col,row") を組み立てる */
const cellKey = (cell: Cell): string => `${cell.col},${cell.row}`

/** 2 セルが同一または隣接（斜め含む8方向）か */
const isAdjacentOrSame = (a: Cell, b: Cell): boolean =>
  Math.abs(a.col - b.col) <= 1 && Math.abs(a.row - b.row) <= 1

/** cell 自身とその8近傍（斜め含む、視界と同じ範囲）を列挙する */
const visibleAreaOf = (cell: Cell): Cell[] => {
  const cells: Cell[] = []

  for (let dRow = -1; dRow <= 1; dRow += 1) {
    for (let dCol = -1; dCol <= 1; dCol += 1) {
      cells.push({ col: cell.col + dCol, row: cell.row + dRow })
    }
  }

  return cells
}

type VisibilityRegistryValue = {
  /** cell が表示可能（視界内、または到達済み表示ONで到達済み）か */
  isVisible: (cell: Cell) => boolean
  /**
   * 現在地を cell へ更新し、視界（cell 自身と8近傍）を到達済みとして記録する
   *
   * - 「視界内に入ったら到達扱い」の方針。視界を離れても到達済み表示ONなら
   *   見え続ける
   * - 全登録 DOM を直書きで表示/非表示に切り替える。React state を持たないため、
   *   この呼出で購読側は再レンダリングされない
   */
  markVisited: (cell: Cell) => void
  /**
   * セルの表示切替対象 DOM を登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   * - `kind` ごとに別 DOM を持てる（`GeoLayer`（stage-06）の床タイル = `floor`、
   *   `AdjacentMoveLayer` のセル選択 button = `select`、`GoalMarkerLayer`
   *   （proto-01 と共用）の旗表示 = `marker`）
   * - 登録時、その cell の現在の可視状態を DOM へ即反映する（再マウント復帰用）
   */
  registerVisibilityNode: (
    cell: Cell,
    kind: NodeKind,
    el: HTMLElement | null,
  ) => void
  /**
   * 到達済みマス（視界外）を表示するかを切替える
   *
   * - 全登録 DOM を直書きで再計算する
   */
  setShowVisited: (show: boolean) => void
}

const VisibilityRegistryContext = createContext<null | VisibilityRegistryValue>(
  null,
)

/**
 * 現在地・到達済みセルを ref で保持し、可視状態を DOM 直書きで反映する Provider
 *
 * - `useState` を持たず、到達（`markVisited`）のたびに配下を再レンダリングしない
 *   (proto-01 `ActorNodeRegistryProvider` と同じ狙い)
 * - 可視判定は「視界（現在地自身、またはそこへ隣接。斜め含む8方向）」または
 *   「到達済み表示ONかつ到達済みセル」。いずれにも該当しないセルは非表示
 *   （`display: none`）にし、ボタン等のクリックも自然に不可になる
 * - 視界に入ったセルは自動的に到達済みとして記録される（`markVisited` が現在地の
 *   視界全体を到達済みへ追加）。視界を離れても到達済み表示ONなら見え続ける
 * - 現在地・到達済みセルの初期値は bot の初期セル `START_POSITION` と\
 *   その視界に固定（proto-02 は `ActorNodeRegistryProvider` の `initialPosition`\
 *   も同じ値を渡している）
 */
export const VisibilityRegistryProvider = (props: PropsWithChildren) => {
  const { children } = props

  const currentRef = useRef<Cell>(START_POSITION)
  const visitedRef = useRef(new Set(visibleAreaOf(START_POSITION).map(cellKey)))
  const showVisitedRef = useRef(true)
  const nodesRef = useRef(new Map<string, Map<NodeKind, HTMLElement>>())

  const isVisible = useCallback((cell: Cell): boolean => {
    if (isAdjacentOrSame(cell, currentRef.current)) {
      return true
    }

    return showVisitedRef.current && visitedRef.current.has(cellKey(cell))
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

  /** 登録済み全セルの可視状態を再計算する（グリッドが小規模なため全走査で十分） */
  const recomputeAll = useCallback(() => {
    for (const key of nodesRef.current.keys()) {
      const [col, row] = key.split(',').map(Number)

      applyVisibility({ col, row })
    }
  }, [applyVisibility])

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
      currentRef.current = cell

      for (const visible of visibleAreaOf(cell)) {
        visitedRef.current.add(cellKey(visible))
      }

      recomputeAll()
    },
    [recomputeAll],
  )

  const setShowVisited = useCallback(
    (show: boolean) => {
      showVisitedRef.current = show
      recomputeAll()
    },
    [recomputeAll],
  )

  const value = useMemo(
    () => ({ isVisible, markVisited, registerVisibilityNode, setShowVisited }),
    [isVisible, markVisited, registerVisibilityNode, setShowVisited],
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

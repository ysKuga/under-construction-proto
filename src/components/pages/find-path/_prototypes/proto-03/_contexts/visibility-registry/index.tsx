'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

import { HEX_DIRECTIONS, HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { START_POSITION } from '../../constants'

/** 表示切替対象 DOM の用途 */
type NodeKind = 'floor' | 'marker' | 'waypoint'

/** セルキー ("q,r") を組み立てる */
const cellKey = (cell: HexCell): string => `${cell.q},${cell.r}`

/** 2 セルが同一または隣接（6方向）か */
const isAdjacentOrSame = (a: HexCell, b: HexCell): boolean =>
  (a.q === b.q && a.r === b.r) ||
  HEX_DIRECTIONS.some(
    (direction) => a.q + direction.q === b.q && a.r + direction.r === b.r,
  )

/** cell 自身とその6近傍（視界と同じ範囲）を列挙する */
const visibleAreaOf = (cell: HexCell): HexCell[] => [
  cell,
  ...HEX_DIRECTIONS.map((direction) => ({
    q: cell.q + direction.q,
    r: cell.r + direction.r,
  })),
]

type VisibilityRegistryValue = {
  /** cell が表示可能（視界内、または到達済み表示ONで到達済み）か */
  isVisible: (cell: HexCell) => boolean
  /**
   * 現在地を cell へ更新し、視界（cell 自身と6近傍）を到達済みとして記録する
   *
   * - 「視界内に入ったら到達扱い」の方針。視界を離れても到達済み表示ONなら
   *   見え続ける
   * - 全登録 DOM を直書きで表示/非表示に切り替える。React state を持たないため、
   *   この呼出で購読側は再レンダリングされない
   */
  markVisited: (cell: HexCell) => void
  /**
   * セルの表示切替対象 DOM を登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   * - `kind` ごとに別 DOM を持てる（`GeoLayer`（stage-07）の hex タイル =
   *   `floor`、`GoalMarkerLayer` 等の疎な配置マーカー = `marker`、全セルに
   *   存在する `WaypointSelectLayer` は `marker` と同一セルで衝突しうるため
   *   独立した `waypoint`）
   * - 登録時、その cell の現在の可視状態を DOM へ即反映する（再マウント復帰用）
   */
  registerVisibilityNode: (
    cell: HexCell,
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
 * - proto-02 `VisibilityRegistryProvider`（矩形グリッド・8近傍）の hex 版。
 *   axial 座標（`HexCell`）・6近傍（`HEX_DIRECTIONS`）で判定する点のみ異なる
 * - `useState` を持たず、到達（`markVisited`）のたびに配下を再レンダリングしない
 * - 可視判定は「視界（現在地自身、またはそこへ隣接。6方向）」または
 *   「到達済み表示ONかつ到達済みセル」。いずれにも該当しないセルは非表示
 *   （`display: none`）にする
 * - 現在地・到達済みセルの初期値は bot の初期セル `START_POSITION` と\
 *   その視界に固定
 */
export const VisibilityRegistryProvider = (props: PropsWithChildren) => {
  const { children } = props

  const currentRef = useRef<HexCell>(START_POSITION)
  const visitedRef = useRef(new Set(visibleAreaOf(START_POSITION).map(cellKey)))
  const showVisitedRef = useRef(true)
  const nodesRef = useRef(new Map<string, Map<NodeKind, HTMLElement>>())

  const isVisible = useCallback((cell: HexCell): boolean => {
    if (isAdjacentOrSame(cell, currentRef.current)) {
      return true
    }

    return showVisitedRef.current && visitedRef.current.has(cellKey(cell))
  }, [])

  const applyVisibility = useCallback(
    (cell: HexCell) => {
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
      const [q, r] = key.split(',').map(Number)

      applyVisibility({ q, r })
    }
  }, [applyVisibility])

  const registerVisibilityNode = useCallback(
    (cell: HexCell, kind: NodeKind, el: HTMLElement | null) => {
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
    (cell: HexCell) => {
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

'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

/** グリッド上の位置 (0-indexed) */
export type GridPosition = {
  /** 列 */
  col: number
  /** 行 */
  row: number
}

/** グリッドの形状 */
export type GridSize = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/** initialPosition 未指定時の既定セル */
const DEFAULT_INITIAL_POSITION: GridPosition = { col: 0, row: 0 }

/**
 * col/row を 0〜(max-1) にクランプする
 *
 * - 経路探索はせず、呼び出し側が計算した target を範囲内へ収めるだけ
 */
const clampPosition = (
  target: GridPosition,
  gridSize: GridSize,
): GridPosition => {
  const clamp = (value: number, max: number) =>
    Math.min(Math.max(value, 0), max)

  return {
    col: clamp(target.col, gridSize.cols - 1),
    row: clamp(target.row, gridSize.rows - 1),
  }
}

/** セル中央の left/top(%) を返す */
const toCellPercent = (position: GridPosition, gridSize: GridSize) => ({
  left: `${((position.col + 0.5) / gridSize.cols) * 100}%`,
  top: `${((position.row + 0.5) / gridSize.rows) * 100}%`,
})

type ActorNodeRegistryValue = {
  /** actor の現在セルを返す (ref 保持値。未移動時は initialPosition) */
  getActorPosition: (id: string) => GridPosition
  /** グリッドの形状 */
  gridSize: GridSize
  /** actor の初期セル (Provider prop)。初期描画の配置に使う */
  initialPosition: GridPosition
  /**
   * id の bot を target セルへ移動する
   *
   * - clamp 済みの left/top(%) を登録ノードの style へ直接書込む
   * - React state を持たないため、この呼出で購読側は再レンダリングされない
   */
  moveActor: (id: string, target: GridPosition) => void
  /**
   * bot ラッパー DOM を id で登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   * - 登録時、その id の現在セルを DOM へ即反映する (再マウント復帰用)
   */
  registerActorNode: (id: string, el: HTMLElement | null) => void
}

const ActorNodeRegistryContext = createContext<ActorNodeRegistryValue | null>(
  null,
)

type ActorNodeRegistryProviderProps = PropsWithChildren<{
  /** グリッドの形状 */
  gridSize: GridSize
  /** actor の初期セル。未指定は (0, 0) */
  initialPosition?: GridPosition
}>

/**
 * actor 位置を ref で保持し、移動を DOM 直書きで反映する Provider
 *
 * - `useState` を持たず、移動しても配下は再レンダリングしない
 *   (`usePerspectiveControl` が `--floor-tilt` を直書きするのと同じ狙い)
 * - 複数 actor 対応のため id → DOM ノード / id → セル の Map を持つ
 *   (`.claude/rules/react/r3f-state.md` 複数消費者 → Context 配布)
 */
export const ActorNodeRegistryProvider = (
  props: ActorNodeRegistryProviderProps,
) => {
  const {
    children,
    gridSize,
    initialPosition = DEFAULT_INITIAL_POSITION,
  } = props

  const nodesRef = useRef(new Map<string, HTMLElement>())
  const positionsRef = useRef(new Map<string, GridPosition>())

  const getActorPosition = useCallback(
    (id: string) => positionsRef.current.get(id) ?? initialPosition,
    [initialPosition],
  )

  const applyToNode = useCallback(
    (id: string, position: GridPosition) => {
      const node = nodesRef.current.get(id)

      if (!node) {
        return
      }

      const { left, top } = toCellPercent(position, gridSize)

      node.style.left = left
      node.style.top = top
    },
    [gridSize],
  )

  const registerActorNode = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (el === null) {
        nodesRef.current.delete(id)

        return
      }

      nodesRef.current.set(id, el)
      applyToNode(id, positionsRef.current.get(id) ?? initialPosition)
    },
    [applyToNode, initialPosition],
  )

  const moveActor = useCallback(
    (id: string, target: GridPosition) => {
      const next = clampPosition(target, gridSize)

      positionsRef.current.set(id, next)
      applyToNode(id, next)
    },
    [applyToNode, gridSize],
  )

  const value = useMemo(
    () => ({
      getActorPosition,
      gridSize,
      initialPosition,
      moveActor,
      registerActorNode,
    }),
    [getActorPosition, gridSize, initialPosition, moveActor, registerActorNode],
  )

  return (
    <ActorNodeRegistryContext.Provider value={value}>
      {children}
    </ActorNodeRegistryContext.Provider>
  )
}

/** actor-node-registry の API を取得する */
export const useActorNodeRegistry = (): ActorNodeRegistryValue => {
  const context = useContext(ActorNodeRegistryContext)

  if (context === null) {
    throw new Error(
      'useActorNodeRegistry should be used within <ActorNodeRegistryProvider>',
    )
  }

  return context
}

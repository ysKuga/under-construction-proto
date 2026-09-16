'use client'

import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'

import { HexCell } from '../../_lib/hex'

/** initialCell 未指定時の既定セル(axial 原点) */
const DEFAULT_INITIAL_CELL: HexCell = { q: 0, r: 0 }

type ActorNodeRegistryValue = {
  /** actor の現在セル */
  currentCell: HexCell
  /**
   * actor を target セルへ移動する
   *
   * - 隣接判定・進入可否判定は呼び出し側の責務（`useHexMove` のクリック検証、
   *   tick ドライバの経路検証等）。ここでは state を更新するだけ
   */
  moveActor: (target: HexCell) => void
}

const ActorNodeRegistryContext = createContext<ActorNodeRegistryValue | null>(
  null,
)

type ActorNodeRegistryProviderProps = PropsWithChildren<{
  /** actor の初期セル。未指定は axial 原点 (0, 0) */
  initialCell?: HexCell
}>

/**
 * hex グリッド上の actor 位置を保持する Provider
 *
 * - stage-06 の同名 Context と異なり DOM 直書きはしない。stage-07 は元々
 *   `currentCell` を通常の `useState` として持ち、props 経由で `ActorsLayer` が
 *   再レンダリングする設計のため、その流儀のまま Context 化するだけに留める
 *   （hex は隣接6方向が等距離のため、stage-06 のような距離比例 duration 算出も不要）
 * - `Stage07` の外側に置く。tick ドライバ（find-path proto-03）がクリックを介さず
 *   `moveActor` を直接呼べるようにするため（複数消費者 → Context 配布）
 */
export const ActorNodeRegistryProvider = (
  props: ActorNodeRegistryProviderProps,
) => {
  const { children, initialCell = DEFAULT_INITIAL_CELL } = props

  const [currentCell, setCurrentCell] = useState(initialCell)

  const value = useMemo(
    () => ({ currentCell, moveActor: setCurrentCell }),
    [currentCell],
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

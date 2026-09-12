'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'

type PlannedPathCellRegistryValue = {
  /**
   * 予定経路上の 1 手（`order`）を CSS transition でフェードアウトする
   *
   * - `style.opacity` を直書きするのみ。React state を持たないため、\
   *   この呼出で購読側は再レンダリングされない
   */
  fadeOutStep: (order: number) => void
  /**
   * 予定経路上の 1 手（`order`）の DOM を登録する
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   * - `order` は経路計画中つねに新しい値が発行される（`popStep` で末尾を\
   *   削除しても、次の `appendStep` は現在の配列長 + 1 を発行するため既出の\
   *   番号は再利用されない）。フェードアウト済みの番号が同じキーで再出現する\
   *   ことはないため、`resetCell` 相当の巻き戻しは不要
   */
  registerStepNode: (order: number, el: HTMLElement | null) => void
  /**
   * 登録済みの全 step を再表示する
   *
   * - 予定経路の一括クリア（歩き切り・実行完了）時に呼ぶ。DOM 直書きは React の\
   *   style diffing に乗らず、`setPlannedPath([])` の再レンダリングだけでは\
   *   fadeOutStep 済みの DOM が opacity: 0 のまま残るため明示的に戻す
   */
  resetAllSteps: () => void
}

const PlannedPathCellRegistryContext =
  createContext<null | PlannedPathCellRegistryValue>(null)

/**
 * 予定経路の各 step（経路上の出現ごと、1 始まりの通し番号）の DOM を ref で保持し、
 * 到達済み step のフェードアウトを DOM 直書きで反映する Provider
 *
 * - `useState` を持たず、フェードアウトしても配下は再レンダリングしない
 *   (`ActorNodeRegistryProvider` と同じ狙い)
 * - 予定経路自体(表示する内容)は `usePlannedPathStore` の React state のまま。\
 *   ここは到達済み step の opacity のみを直書きする
 * - キーはセル座標でなく `order`（経路上の通し番号）。同じセルを複数回通る経路でも\
 *   出現ごとに個別にフェードアウトできる
 */
export const PlannedPathCellRegistryProvider = (props: PropsWithChildren) => {
  const { children } = props

  const nodesRef = useRef(new Map<number, HTMLElement>())

  const registerStepNode = useCallback(
    (order: number, el: HTMLElement | null) => {
      if (el === null) {
        nodesRef.current.delete(order)

        return
      }

      nodesRef.current.set(order, el)
    },
    [],
  )

  const fadeOutStep = useCallback((order: number) => {
    nodesRef.current.get(order)?.style.setProperty('opacity', '0')
  }, [])

  const resetAllSteps = useCallback(() => {
    nodesRef.current.forEach((node) => {
      node.style.setProperty('opacity', '1')
    })
  }, [])

  const value = useMemo(
    () => ({ fadeOutStep, registerStepNode, resetAllSteps }),
    [fadeOutStep, registerStepNode, resetAllSteps],
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

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

/** セルキー ("col,row") を組み立てる */
const cellKey = (cell: Cell): string => `${cell.col},${cell.row}`

type PlannedPathCellRegistryValue = {
  /**
   * セル（`Cell`）の背景・枠線を「未選択」の見た目へ戻す（`variant: 'list'` のみ有効）
   *
   * - `list` variant のセル背景・枠線は React state（`hasOrders`）ベースの\
   *   静的な値のため、`fadeOutStep` で番号が消えてもセル自体は選択中の見た目の\
   *   まま残る。そのセルの最後の番号が消化されたタイミングで呼び、DOM 直書きで\
   *   `transparent` へ戻す
   */
  fadeOutCell: (cell: Cell) => void
  /**
   * 予定経路上の 1 手（`order`）を CSS transition でフェードアウトする
   *
   * - `style.opacity` を直書きするのみ。React state を持たないため、\
   *   この呼出で購読側は再レンダリングされない
   * - `promoteOrder` を渡すと、同時にその番号を最前面スタイルへ切り替える\
   *   （`variant: 'stacked'` のときのみ有効。同じセルを複数回通る経路で、\
   *   1 枚消化して次の番号が見た目上の最前面になるタイミングに使う）。\
   *   `promoteAsLast` が true なら「重なりが残り 1 枚になった」印として\
   *   半透明、false なら不透明にする
   */
  fadeOutStep: (
    order: number,
    promoteOrder?: number,
    promoteAsLast?: boolean,
  ) => void
  /**
   * セル（`Cell`）全体の DOM を登録する（`variant: 'list'` の背景・枠線用）
   *
   * - JSX の `ref` コールバックから呼ぶ。unmount 時は el=null で解除
   */
  registerCellNode: (cell: Cell, el: HTMLElement | null) => void
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

type PlannedPathCellRegistryProviderProps = PropsWithChildren<{
  /**
   * 番号表示方式（`PlannedPathLayer` の `variant` と同じ値を渡す）
   *
   * - `'stacked'` のときのみ `fadeOutStep` の `promoteOrder` を有効にする。\
   *   `'list'` の DOM には background 指定がなく無意味な操作になるため\
   *   明示的に no-op にする
   */
  variant?: 'list' | 'stacked'
}>

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
export const PlannedPathCellRegistryProvider = (
  props: PlannedPathCellRegistryProviderProps,
) => {
  const { children, variant = 'list' } = props

  const nodesRef = useRef(new Map<number, HTMLElement>())
  const cellNodesRef = useRef(new Map<string, HTMLElement>())

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

  const registerCellNode = useCallback((cell: Cell, el: HTMLElement | null) => {
    const key = cellKey(cell)

    if (el === null) {
      cellNodesRef.current.delete(key)

      return
    }

    cellNodesRef.current.set(key, el)
  }, [])

  const fadeOutCell = useCallback(
    (cell: Cell) => {
      if (variant !== 'list') {
        return
      }

      const node = cellNodesRef.current.get(cellKey(cell))

      node?.style.setProperty('background', 'transparent')
      node?.style.setProperty('border', '1px solid transparent')
    },
    [variant],
  )

  const fadeOutStep = useCallback(
    (order: number, promoteOrder?: number, promoteAsLast?: boolean) => {
      nodesRef.current.get(order)?.style.setProperty('opacity', '0')

      if (variant === 'stacked' && promoteOrder !== undefined) {
        const background = promoteAsLast
          ? 'rgba(56, 189, 248, 0.55)'
          : 'rgba(56, 189, 248, 1)'

        nodesRef.current
          .get(promoteOrder)
          ?.style.setProperty('background', background)
      }
    },
    [variant],
  )

  const resetAllSteps = useCallback(() => {
    nodesRef.current.forEach((node) => {
      node.style.setProperty('opacity', '1')
    })
    cellNodesRef.current.forEach((node) => {
      node.style.removeProperty('background')
      node.style.removeProperty('border')
    })
  }, [])

  const value = useMemo(
    () => ({
      fadeOutCell,
      fadeOutStep,
      registerCellNode,
      registerStepNode,
      resetAllSteps,
    }),
    [
      fadeOutCell,
      fadeOutStep,
      registerCellNode,
      registerStepNode,
      resetAllSteps,
    ],
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

'use client'

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { useFogStoreApi } from '../../_stores/fog'

/** 表示切替対象 DOM の用途 */
type NodeKind = 'floor' | 'marker' | 'waypoint'

/** セルキー ("q,r") を組み立てる */
const cellKey = (cell: HexCell): string => `${cell.q},${cell.r}`

type VisibilityRegistryValue = {
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
}

const VisibilityRegistryContext = createContext<null | VisibilityRegistryValue>(
  null,
)

/**
 * セルの表示切替対象 DOM を保持し、fog store の可視判定を DOM 直書きで反映する Provider
 *
 * - proto-02 `VisibilityRegistryProvider`（矩形グリッド・8近傍）の hex 版
 * - 霧の状態・可視判定は fog store（`_stores/fog`）が持つ。この Provider は DOM の
 *   登録と反映のみを担い、`FogStoreProvider` の内側に置く
 * - fog store を `subscribe` し、変化のたびに全登録 DOM を再計算する。
 *   `useState` を持たないため、配下は再レンダリングされない
 * - 非表示セルは `display: none` にする
 */
export const VisibilityRegistryProvider = (props: PropsWithChildren) => {
  const { children } = props

  const fogStoreApi = useFogStoreApi()
  const nodesRef = useRef(new Map<string, Map<NodeKind, HTMLElement>>())

  const applyVisibility = useCallback(
    (cell: HexCell) => {
      const nodes = nodesRef.current.get(cellKey(cell))

      if (!nodes) {
        return
      }

      const display = fogStoreApi.getState().isVisible(cell) ? '' : 'none'

      nodes.forEach((node) => {
        node.style.display = display
      })
    },
    [fogStoreApi],
  )

  // fog store の変化時、登録済み全セルの可視状態を再計算する（グリッドが小規模なため全走査で十分）
  useEffect(
    () =>
      fogStoreApi.subscribe(() => {
        for (const key of nodesRef.current.keys()) {
          const [q, r] = key.split(',').map(Number)

          applyVisibility({ q, r })
        }
      }),
    [applyVisibility, fogStoreApi],
  )

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

  const value = useMemo(
    () => ({ registerVisibilityNode }),
    [registerVisibilityNode],
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

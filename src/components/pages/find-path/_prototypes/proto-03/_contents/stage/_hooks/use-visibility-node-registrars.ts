import { useCallback } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { useVisibilityRegistry } from '../../../_contexts/visibility-registry'
import { UseStageReturn } from '../index.types'

/** レイヤー種別ごとに `kind` を固定した visibility registry 登録関数を返す */
export const useVisibilityNodeRegistrars = (): Pick<
  UseStageReturn,
  | 'registerFloorVisibilityNode'
  | 'registerMarkerVisibilityNode'
  | 'registerWaypointVisibilityNode'
> => {
  const { registerVisibilityNode } = useVisibilityRegistry()

  const registerMarkerVisibilityNode = useCallback(
    (cell: HexCell, el: HTMLElement | null) =>
      registerVisibilityNode(cell, 'marker', el),
    [registerVisibilityNode],
  )
  const registerFloorVisibilityNode = useCallback(
    (cell: HexCell, el: HTMLElement | null) =>
      registerVisibilityNode(cell, 'floor', el),
    [registerVisibilityNode],
  )
  const registerWaypointVisibilityNode = useCallback(
    (cell: HexCell, el: HTMLElement | null) =>
      registerVisibilityNode(cell, 'waypoint', el),
    [registerVisibilityNode],
  )

  return {
    registerFloorVisibilityNode,
    registerMarkerVisibilityNode,
    registerWaypointVisibilityNode,
  }
}

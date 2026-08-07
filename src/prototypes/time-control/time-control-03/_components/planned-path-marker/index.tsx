import { memo } from 'react'

import { toPixelStyle } from '../../../time-control-02/_lib/stage-coords'
import { usePlannedPathStore } from '../../_contexts/planned-path-store-context'
import { ActorId } from '../../types'

type PlannedPathMarkerProps = {
  /** 表示対象の actor */
  id: ActorId
}

/**
 * actor 1体分の予定位置表示 (CSS 絶対位置、残り経路の各点)
 *
 * - memo + 自身の id のみを鍵にした selector により、他 actor の企図では\
 *   再レンダリングされない
 * - `plannedPathStore` のみを購読するため、行動決定では再レンダリングされない\
 *   (`plannedPathStore` は `set target` (企図) でのみ更新される。実行用の\
 *   `pathStore` とは別で、行動決定による消費の影響を受けない)
 */
export const PlannedPathMarker = memo((props: PlannedPathMarkerProps) => {
  const { id } = props

  const plannedPath = usePlannedPathStore(
    (state) => state.plannedPathById[id] ?? [],
  )

  return (
    <>
      {plannedPath.map((step, index) => (
        <div
          className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300"
          key={index}
          style={toPixelStyle(step)}
        />
      ))}
    </>
  )
})

PlannedPathMarker.displayName = 'PlannedPathMarker'

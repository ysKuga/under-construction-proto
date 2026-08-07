import { memo } from 'react'

import { toPixelStyle } from '../../../time-control-02/_lib/stage-coords'
import { usePositionStore } from '../../_contexts/position-store-context'
import { DEFAULT_POSITION } from '../../_stores/position-store'
import { ActorId } from '../../types'

type CurrentPositionMarkerProps = {
  /** 表示対象の actor */
  id: ActorId
}

/**
 * actor 1体分の現在位置表示 (CSS 絶対位置)
 *
 * - memo + 自身の id のみを鍵にした selector により、他 actor の行動決定では\
 *   再レンダリングされない
 * - `positionStore` のみを購読するため、`set target` (企図) では再レンダリングされない\
 *   (`positionStore` は行動決定でのみ更新される)
 */
export const CurrentPositionMarker = memo(
  (props: CurrentPositionMarkerProps) => {
    const { id } = props

    const position = usePositionStore(
      (state) => state.positionById[id] ?? DEFAULT_POSITION,
    )

    return (
      <div
        className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
        style={toPixelStyle(position)}
        title={id}
      >
        {id.split('-').pop()}
      </div>
    )
  },
)

CurrentPositionMarker.displayName = 'CurrentPositionMarker'

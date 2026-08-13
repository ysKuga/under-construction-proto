import { memo } from 'react'

import { useEffectApplyPosition } from './_hooks/use-effect-apply-position'
import { CurrentPositionMarkerProps } from './index.types'

/**
 * actor 1体分の現在位置表示 (CSS 絶対位置)
 *
 * - `set target` (企図) は購読対象外のため影響しない\
 *   (`positionStore` は行動決定でのみ更新される)
 */
export const CurrentPositionMarker = memo(
  (props: CurrentPositionMarkerProps) => {
    const { id } = props

    const markerRef = useEffectApplyPosition(props)

    return (
      <div
        className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white transition-[left,top] ease-linear"
        ref={markerRef}
        title={id}
      >
        {id.split('-').pop()}
      </div>
    )
  },
)

CurrentPositionMarker.displayName = 'CurrentPositionMarker'

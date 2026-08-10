import { memo, useEffect, useRef } from 'react'

import { usePositionStoreApi } from '../../_contexts/position-store-context'
import { useStageTransform } from '../../_contexts/stage-transform-context'
import { toPixelStyle } from '../../_lib/stage-coords'
import { DEFAULT_POSITION } from '../../_stores/position-store'
import { ActorId, Position } from '../../types'

type CurrentPositionMarkerProps = {
  /** 表示対象の actor */
  id: ActorId
}

/**
 * actor 1体分の現在位置表示 (CSS 絶対位置)
 *
 * - `positionStore` を直接 subscribe し、position 変化時は ref 経由で DOM の style を\
 *   直接書き換える。React の再レンダリングを経由しないため、行動決定による\
 *   position 更新でもコンポーネント自体は再レンダリングされない
 * - `set target` (企図) は購読対象外のため影響しない\
 *   (`positionStore` は行動決定でのみ更新される)
 */
export const CurrentPositionMarker = memo(
  (props: CurrentPositionMarkerProps) => {
    const { id } = props

    const positionStoreApi = usePositionStoreApi()
    const transform = useStageTransform()
    const markerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const applyPosition = (position: Position) => {
        if (!markerRef.current) {
          return
        }

        const { left, top } = toPixelStyle(position, transform)

        markerRef.current.style.left = `${left}px`
        markerRef.current.style.top = `${top}px`
      }

      applyPosition(
        positionStoreApi.getState().positionById[id] ?? DEFAULT_POSITION,
      )

      return positionStoreApi.subscribe((state) =>
        applyPosition(state.positionById[id] ?? DEFAULT_POSITION),
      )
    }, [id, positionStoreApi, transform])

    return (
      <div
        className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
        ref={markerRef}
        title={id}
      >
        {id.split('-').pop()}
      </div>
    )
  },
)

CurrentPositionMarker.displayName = 'CurrentPositionMarker'

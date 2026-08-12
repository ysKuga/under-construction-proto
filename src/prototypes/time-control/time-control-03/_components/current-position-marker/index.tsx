import { memo, useEffect, useRef } from 'react'

import { getTickMs } from '../../../time-control-02/_lib/get-tick-ms'
import { usePositionStoreApi } from '../../_contexts/position-store-context'
import { useStageTransform } from '../../_contexts/stage-transform-context'
import { toPixelStyle } from '../../_lib/stage-coords'
import { useActorStore } from '../../_stores/actor'
import { DEFAULT_ACTOR_INFO } from '../../_stores/actor/constants'
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
 * - tick 間の移動は CSS transition (`transitionDuration` = tickMs) で補間する。\
 *   初回表示のみ transition なしで即時配置する (0,0 からのスライドを防ぐ)
 */
export const CurrentPositionMarker = memo(
  (props: CurrentPositionMarkerProps) => {
    const { id } = props

    const positionStoreApi = usePositionStoreApi()
    const transform = useStageTransform()
    const tickRate = useActorStore(
      (state) => state.actorById[id]?.tickRate ?? DEFAULT_ACTOR_INFO.tickRate,
    )
    const tickMs = getTickMs(tickRate)
    const markerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const applyPosition = (position: Position, animate: boolean) => {
        if (!markerRef.current) {
          return
        }

        const { left, top } = toPixelStyle(position, transform)

        markerRef.current.style.transitionDuration = animate
          ? `${tickMs}ms`
          : '0ms'
        markerRef.current.style.left = `${left}px`
        markerRef.current.style.top = `${top}px`
      }

      applyPosition(
        positionStoreApi.getState().positionById[id] ?? DEFAULT_POSITION,
        false,
      )

      return positionStoreApi.subscribe((state) =>
        applyPosition(state.positionById[id] ?? DEFAULT_POSITION, true),
      )
    }, [id, positionStoreApi, tickMs, transform])

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

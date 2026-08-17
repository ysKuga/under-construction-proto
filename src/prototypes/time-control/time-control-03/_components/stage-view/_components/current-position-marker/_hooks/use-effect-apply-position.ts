import { useEffect, useRef } from 'react'

import { getTickMs } from '../../../../../../time-control-02/_lib/get-tick-ms'
import { useTimeControl03Computed } from '../../../../../_computed'
import { toPixelStyle } from '../../../../../_lib/stage-coords'
import { useActorStore, usePositionStoreApi } from '../../../../../_stores'
import { Position } from '../../../../../types'
import { CurrentPositionMarkerProps } from '../index.types'

/**
 * position store 購読、DOM の style 直接書換で位置反映
 *
 * - React の再レンダリングを経由しないため、行動決定による position 更新でも\
 *   コンポーネント自体は再レンダリングされない
 * - tick 間の移動は CSS transition (`transitionDuration` = tickMs) で補間する。\
 *   初回表示のみ transition なしで即時配置する (0,0 からのスライドを防ぐ)
 *
 * @param props CurrentPositionMarker に渡される props
 */
export const useEffectApplyPosition = (props: CurrentPositionMarkerProps) => {
  const { id } = props

  const positionStoreApi = usePositionStoreApi()
  const transform = useTimeControl03Computed((state) => state.stageTransform)
  const tickRate = useActorStore((state) => state.getActorInfo(id).tickRate)
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

    applyPosition(positionStoreApi.getState().getPosition(id), false)

    return positionStoreApi.subscribe((state) =>
      applyPosition(state.getPosition(id), true),
    )
  }, [id, positionStoreApi, tickMs, transform])

  return markerRef
}

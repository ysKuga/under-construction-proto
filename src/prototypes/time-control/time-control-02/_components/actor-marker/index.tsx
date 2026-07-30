import { memo } from 'react'

import { useActorStore } from '../../_contexts/actor-store-context'
import { toPixelStyle } from '../../_lib/stage-coords'
import { DEFAULT_POSITION } from '../../_stores/actor-store'
import { ActorId } from '../../types'

type ActorMarkerProps = {
  /** 表示対象の actor */
  id: ActorId
}

/**
 * actor 1体分の CSS 絶対位置表示 (現在位置 + 残り経路 + 移動軌跡)
 *
 * - memo + 自身の id のみを鍵にした selector により、他 actor の移動では再レンダリングされない\
 *   (ただし軌跡は actionLog 全体を購読するため、他 actor の行動決定でも再レンダリングされる。\
 *   `ActionLogPanel`/`SchedulePreview` と同じ許容範囲)
 * - 軌跡 (行動履歴) は消化済みの経路点であっても消さず、actionLog から都度導出して残し続ける
 */
export const ActorMarker = memo((props: ActorMarkerProps) => {
  const { id } = props

  const position = useActorStore(
    (state) => state.positionById[id] ?? DEFAULT_POSITION,
  )
  const path = useActorStore((state) => state.movePathById[id] ?? [])
  const trail = useActorStore((state) =>
    state.actionLog
      .filter(
        (entry) => entry.event.actorId === id && entry.event.phase !== 'intent',
      )
      .map((entry) => entry.event.target),
  )

  return (
    <>
      {trail.map((step, index) => (
        <div
          className="absolute size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200"
          key={index}
          style={toPixelStyle(step)}
        />
      ))}
      {path.map((step, index) => (
        <div
          className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300"
          key={index}
          style={toPixelStyle(step)}
        />
      ))}
      <div
        className="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
        style={toPixelStyle(position)}
        title={id}
      >
        {id.split('-').pop()}
      </div>
    </>
  )
})

ActorMarker.displayName = 'ActorMarker'

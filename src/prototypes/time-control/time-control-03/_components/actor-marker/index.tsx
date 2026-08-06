import { memo } from 'react'
import { shallow } from 'zustand/shallow'

import { toPixelStyle } from '../../../time-control-02/_lib/stage-coords'
import { useGameClockStore } from '../../_contexts/game-clock-store-context'
import { usePathStore } from '../../_contexts/path-store-context'
import { usePositionStore } from '../../_contexts/position-store-context'
import { getEventLogByActorId } from '../../_stores/game-clock-store'
import { DEFAULT_POSITION } from '../../_stores/position-store'
import { ActorId } from '../../types'

type ActorMarkerProps = {
  /** 表示対象の actor */
  id: ActorId
}

/**
 * actor 1体分の CSS 絶対位置表示 (現在位置 + 残り経路 + 移動軌跡)
 *
 * - memo + 自身の id のみを鍵にした selector により、他 actor の移動では再レンダリングされない
 * - 軌跡は `getEventLogByActorId` で自身の分のみ抽出し、shallow 比較 (`zustand/shallow`) で購読する。\
 *   他 actor のイベント追加でも要素は同一参照のまま→ shallow 比較で不一致とならず実 DOM 更新は発生しない
 * - 軌跡 (行動履歴) は消化済みの経路点であっても消さず、eventLog から都度導出して残し続ける
 */
export const ActorMarker = memo((props: ActorMarkerProps) => {
  const { id } = props

  const position = usePositionStore(
    (state) => state.positionById[id] ?? DEFAULT_POSITION,
  )
  const path = usePathStore((state) => state.pathById[id] ?? [])
  const trail = useGameClockStore(
    (state) =>
      getEventLogByActorId(state.eventLog, id)
        .filter((entry) => entry.event.phase !== 'intent')
        .map((entry) => entry.event.target),
    shallow,
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

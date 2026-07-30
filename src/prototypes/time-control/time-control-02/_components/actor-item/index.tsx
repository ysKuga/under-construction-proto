import { memo } from 'react'

import { Button } from '@/components/ui/button'

import { useActorStore } from '../../_contexts/actor-store-context'
import { formatCoord } from '../../_lib/format-coord'
import { getTickMs } from '../../_lib/get-tick-ms'
import {
  DEFAULT_MIN_PATH_STEPS,
  DEFAULT_POSITION,
  DEFAULT_TICK_RATE,
} from '../../_stores/actor-store'
import { ActorId } from '../../types'

type ActorItemProps = {
  /** 表示対象の actor */
  id: ActorId
}

/**
 * actor 1体分の表示・操作
 *
 * - memo + 自身の id のみを鍵にした selector により、他 actor の移動では\
 *   再レンダリングされない
 * - `set target` (企図) → 全体一括の `行動決定`/`mode` (実行、`ActionBar` 側に設置) の2段階操作。\
 *   `set target` の時点では position は動かない
 * - 現在の企図 (intent) は経路 (`movePathById`) の最終要素 (= target) から表示する。\
 *   経路が空なら企図なし/到達済み
 */
export const ActorItem = memo((props: ActorItemProps) => {
  const { id } = props

  const position = useActorStore(
    (state) => state.positionById[id] ?? DEFAULT_POSITION,
  )
  const path = useActorStore((state) => state.movePathById[id] ?? [])
  const tickRate = useActorStore(
    (state) => state.tickRateById[id] ?? DEFAULT_TICK_RATE,
  )
  const minPathSteps = useActorStore(
    (state) => state.minPathStepsById[id] ?? DEFAULT_MIN_PATH_STEPS,
  )
  const intentTarget = path[path.length - 1]
  const etaMs = path.length * getTickMs(tickRate)
  const dispatchMoveIntent = useActorStore((state) => state.dispatchMoveIntent)
  const setMinPathSteps = useActorStore((state) => state.setMinPathSteps)

  return (
    <li className="flex items-center gap-2 whitespace-nowrap border-b border-solid border-gray-200 p-2">
      <span className="min-w-16 text-gray-400">{id}</span>
      <span className="min-w-20">
        ({formatCoord(position.x)}, {formatCoord(position.y)})
      </span>
      <span className="min-w-16 text-gray-400">path: {path.length}</span>
      <span className="min-w-28 text-gray-400">
        target:{' '}
        {intentTarget
          ? `(${formatCoord(intentTarget.x)}, ${formatCoord(intentTarget.y)})`
          : '-'}
      </span>
      <span className="min-w-24 text-gray-400">eta: {etaMs}ms</span>
      <label className="flex items-center gap-1 text-gray-400">
        min:
        <input
          className="w-12 rounded border border-solid border-gray-300 px-1"
          min={1}
          onChange={(event) => {
            // 入力途中 (空文字/0 等) も含めそのまま反映する。\
            // 厳密な下限チェックは使用時 (dispatchMoveIntent) 側で行う。\
            // ここで弾くと controlled input の value が古い値に押し戻され、\
            // 入力中の値が消えて事実上編集不能になる
            setMinPathSteps(id, Number(event.target.value))
          }}
          type="number"
          value={minPathSteps}
        />
      </label>
      <Button
        onClick={() => {
          dispatchMoveIntent({
            actorId: id,
            target: {
              x: position.x + Math.round(Math.random() * 6 - 3),
              y: position.y + Math.round(Math.random() * 6 - 3),
            },
          })
        }}
        size="sm"
        type="button"
      >
        set target
      </Button>
    </li>
  )
})

ActorItem.displayName = 'ActorItem'

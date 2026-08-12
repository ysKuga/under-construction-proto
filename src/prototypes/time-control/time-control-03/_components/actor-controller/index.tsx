import { memo } from 'react'

import { Button } from '@/components/ui/button'

import { formatCoord } from '../../../time-control-02/_lib/format-coord'
import { getTickMs } from '../../../time-control-02/_lib/get-tick-ms'
import { useIntentStore } from '../../_contexts/intent-store-context'
import { usePathStore } from '../../_contexts/path-store-context'
import { usePositionStore } from '../../_contexts/position-store-context'
import { useActorStore } from '../../_stores/actor'
import { DEFAULT_ACTOR_INFO } from '../../_stores/actor/constants'
import { useActorSettingsStore } from '../../_stores/actor-settings'
import { DEFAULT_ACTOR_SETTINGS } from '../../_stores/actor-settings/constants'
import { DEFAULT_PATH } from '../../_stores/path-store'
import { DEFAULT_POSITION } from '../../_stores/position-store'
import { ActorId } from '../../types'

type ActorControllerProps = {
  /** 表示対象の actor */
  id: ActorId
}

/** tick 選択肢 (50ms 刻み、50〜500ms) */
const TICK_MS_OPTIONS = Array.from(
  { length: 10 },
  (_, index) => (index + 1) * 50,
)

/**
 * actor 1体分の操作コントローラー
 *
 * - memo + 自身の id のみを鍵にした selector により、他 actor の移動では\
 *   再レンダリングされない
 * - `set target` (企図) → 全体一括の `行動決定`/`mode` (実行、`ActionBar` 側に設置) の2段階操作。\
 *   `set target` の時点では position は動かない
 * - 現在の企図 (intent) は経路 (`pathById`) の最終要素 (= target) から表示する。\
 *   経路が空なら企図なし/到達済み
 */
export const ActorController = memo((props: ActorControllerProps) => {
  const { id } = props

  const position = usePositionStore(
    (state) => state.positionById[id] ?? DEFAULT_POSITION,
  )
  const path = usePathStore((state) => state.pathById[id] ?? DEFAULT_PATH)
  const tickRate = useActorStore(
    (state) => state.actorById[id]?.tickRate ?? DEFAULT_ACTOR_INFO.tickRate,
  )
  const fixedPathSteps = useActorSettingsStore(
    (state) =>
      state.settingsById[id]?.fixedPathSteps ??
      DEFAULT_ACTOR_SETTINGS.fixedPathSteps,
  )
  const isFixedPathSteps = useActorSettingsStore(
    (state) =>
      state.settingsById[id]?.isFixedPathSteps ??
      DEFAULT_ACTOR_SETTINGS.isFixedPathSteps,
  )
  const intentTarget = path[path.length - 1]
  const tickMs = getTickMs(tickRate)
  const etaMs = path.length * tickMs
  const dispatchMoveIntent = useIntentStore((state) => state.dispatchMoveIntent)
  const setFixedPathSteps = useActorSettingsStore(
    (state) => state.setFixedPathSteps,
  )
  const setIsFixedPathSteps = useActorSettingsStore(
    (state) => state.setIsFixedPathSteps,
  )
  const setTickMs = useActorStore((state) => state.setTickMs)

  return (
    <li className="flex items-center gap-2 whitespace-nowrap border-b border-solid border-gray-200 p-2">
      <span className="min-w-16 text-gray-400">{id}</span>
      <span className="min-w-20">
        ({formatCoord(position.x)}, {formatCoord(position.y)})
      </span>
      <span className="min-w-16 text-gray-400">path: {path.length}</span>
      <label className="flex min-w-28 items-center gap-1 text-gray-400">
        tick:
        <select
          className="rounded border border-solid border-gray-300 px-1"
          onChange={(event) => {
            setTickMs(id, Number(event.target.value))
          }}
          value={Math.round(tickMs)}
        >
          {TICK_MS_OPTIONS.map((ms) => (
            <option key={ms} value={ms}>
              {ms}
            </option>
          ))}
        </select>
        ms
      </label>
      <span className="min-w-24 text-gray-400">eta: {etaMs}ms</span>
      <label className="flex items-center gap-1 text-gray-400">
        <input
          checked={isFixedPathSteps}
          onChange={(event) => {
            setIsFixedPathSteps(id, event.target.checked)
          }}
          type="checkbox"
        />
        固定:
        <input
          className="w-12 rounded border border-solid border-gray-300 px-1 disabled:opacity-50"
          disabled={!isFixedPathSteps}
          min={1}
          onChange={(event) => {
            // 入力途中 (空文字/0 等) も含めそのまま反映する。\
            // 厳密な下限チェックは使用時 (dispatchMoveIntent) 側で行う。\
            // ここで弾くと controlled input の value が古い値に押し戻され、\
            // 入力中の値が消えて事実上編集不能になる
            setFixedPathSteps(id, Number(event.target.value))
          }}
          type="number"
          value={fixedPathSteps}
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
      <span className="text-gray-400">
        target:{' '}
        {intentTarget
          ? `(${formatCoord(intentTarget.x)}, ${formatCoord(intentTarget.y)})`
          : '-'}
      </span>
    </li>
  )
})

ActorController.displayName = 'ActorController'

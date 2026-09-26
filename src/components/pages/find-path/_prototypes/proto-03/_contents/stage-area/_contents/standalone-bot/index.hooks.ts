import { useState } from 'react'

import {
  bodyBobbingAction,
  walkingAction,
  walkingResetAction,
} from '@/components/theater/figure/box-bot'

import { usePlayerActorEventTarget } from '../../../../_contexts/player-actor-event-target'

import { useRelayEvents } from './_hooks/use-relay-events'

/**
 * 独立 bot が受け付け、ステージ上の bot から同期する action
 *
 * - face（向き）は同期しない可能性があるため含めない（issue #248）
 */
export const STANDALONE_BOT_RELAYED_ACTIONS = [
  walkingAction,
  walkingResetAction,
]

/**
 * 独立 bot の `actions`
 *
 * - 中継対象に加え、dispatch 不要で walking に連動する bodyBobbing を含める（中継はしない）
 */
export const STANDALONE_BOT_ACTIONS = [
  ...STANDALONE_BOT_RELAYED_ACTIONS,
  bodyBobbingAction,
]

/**
 * 独立 bot の EventTarget を生成し、ステージ上の bot 宛ての action を中継する
 *
 * - player bot と共有する EventTarget（`PlayerActorEventTargetProvider`）へ dispatch
 *   された `STANDALONE_BOT_RELAYED_ACTIONS` のイベントを、独立 bot の EventTarget へ再送する
 */
export const useStandaloneBotEventTarget = (): EventTarget => {
  const playerActorEventTarget = usePlayerActorEventTarget()
  const [standaloneBotEventTarget] = useState<EventTarget>(
    () => new EventTarget(),
  )

  useRelayEvents(
    playerActorEventTarget,
    standaloneBotEventTarget,
    STANDALONE_BOT_RELAYED_ACTIONS.map((action) => action.event),
  )

  return standaloneBotEventTarget
}

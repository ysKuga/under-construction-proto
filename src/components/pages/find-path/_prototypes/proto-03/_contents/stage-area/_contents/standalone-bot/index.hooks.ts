import { useState } from 'react'

import {
  bodyBobbingAction,
  energyOutAction,
  faceAction,
  walkingAction,
  walkingResetAction,
} from '@/components/theater/figure/box-bot'

import { usePlayerActorEventTarget } from '../../../../_contexts/player-actor-event-target'
import { useDisplaySettingsStore } from '../../../../_stores/display-settings'

import { useRelayEvents } from './_hooks/use-relay-events'
import { useRelayFacing } from './_hooks/use-relay-facing'

/**
 * 独立 bot が受け付け、ステージ上の bot から同期する action
 *
 * - face（向き）は含めない。同期の有無を切り替えるため `useRelayFacing` で別途中継する
 * - energyOut はステージ上の bot 宛てに停止待ち（`useEnergyOutAfterStop`）を経て
 *   dispatch されるため、独立 bot も停止後に演出する
 */
export const STANDALONE_BOT_RELAYED_ACTIONS = [
  walkingAction,
  walkingResetAction,
  energyOutAction,
]

/**
 * 独立 bot の `actions`
 *
 * - 中継対象に加え、dispatch 不要で walking に連動する bodyBobbing を含める（中継はしない）
 * - face は向き同期オプション(`useRelayFacing`)の dispatch 先として含める
 */
export const STANDALONE_BOT_ACTIONS = [
  ...STANDALONE_BOT_RELAYED_ACTIONS,
  bodyBobbingAction,
  faceAction,
]

/**
 * 独立 bot の EventTarget を生成し、ステージ上の bot 宛ての action を中継する
 *
 * - player bot と共有する EventTarget（`PlayerActorEventTargetProvider`）へ dispatch
 *   された `STANDALONE_BOT_RELAYED_ACTIONS` のイベントを、独立 bot の EventTarget へ再送する
 * - 向き(face)は、操作パネルの「状態表示の向きを同期」が有効な間のみ再送する
 */
export const useStandaloneBotEventTarget = (): EventTarget => {
  const playerActorEventTarget = usePlayerActorEventTarget()
  /** 向きをステージ上の bot と同期するか */
  const syncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.syncStandaloneBotFacing,
  )
  const [standaloneBotEventTarget] = useState<EventTarget>(
    () => new EventTarget(),
  )

  useRelayEvents(
    playerActorEventTarget,
    standaloneBotEventTarget,
    STANDALONE_BOT_RELAYED_ACTIONS.map((action) => action.event),
  )
  useRelayFacing(
    playerActorEventTarget,
    standaloneBotEventTarget,
    syncStandaloneBotFacing,
  )

  return standaloneBotEventTarget
}

import { usePlayerActorEventTarget } from '../../../../../../_contexts/player-actor-event-target'
import { useDisplaySettingsStore } from '../../../../../../_stores/display-settings'

import { useRelayEvents } from './_hooks/use-relay-events'
import { useRelayFacing } from './_hooks/use-relay-facing'
import { useStandaloneBotEventTarget } from './_hooks/use-standalone-bot-event-target'
import { useStandaloneBotSize } from './_hooks/use-standalone-bot-size'
import { STANDALONE_BOT_RELAYED_ACTIONS } from './index.constants'
import { UseStandaloneBotReturn } from './index.types'

/**
 * 独立 bot の EventTarget を生成し、大きさとともに返す
 *
 * - player bot と共有する EventTarget（`PlayerActorEventTargetProvider`）へ dispatch
 *   された `STANDALONE_BOT_RELAYED_ACTIONS` のイベントを、独立 bot の EventTarget へ再送する
 * - 向き(face)は、操作パネルの「状態表示の向きを同期」が有効な間のみ再送する
 */
export const useStandaloneBot = (): UseStandaloneBotReturn => {
  /** ステージ上の bot と共有する EventTarget（中継元） */
  const playerActorEventTarget = usePlayerActorEventTarget()
  /** 向きをステージ上の bot と同期するか */
  const syncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.syncStandaloneBotFacing,
  )
  const { standaloneBotEventTarget } = useStandaloneBotEventTarget()

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

  return { standaloneBotEventTarget, ...useStandaloneBotSize() }
}

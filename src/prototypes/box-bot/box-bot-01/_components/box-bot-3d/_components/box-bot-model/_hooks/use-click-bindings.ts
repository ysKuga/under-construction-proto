import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { DEFAULT_CLICK_BINDINGS } from '../_actions'
import { CLICK_BODY, CLICK_HEAD } from '../index.constants'
import type { ClickBindings } from '../index.types'

/**
 * 要素クリックイベント(`CLICK_BODY` / `CLICK_HEAD`)を、対応する action イベントへ中継する
 *
 * - bot 本体は要素押下で `CLICK_*` を発行するだけ。各 action は自分の action イベントを\
 *   購読するだけ。両者の紐づけをこの hook が `bindings`(既定は `DEFAULT_CLICK_BINDINGS`)で行う
 * - どちらもこの対応表の存在を知らない = クリック元と action が疎に保たれる
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 * @param bindings 要素 → action イベント名の上書き(省略キーは既定のまま)
 */
export const useClickBindings = (
  eventTarget: EventTarget,
  bindings: ClickBindings,
): void => {
  const dispatch = useEventDispatcher(eventTarget)
  const resolved = { ...DEFAULT_CLICK_BINDINGS, ...bindings }

  useEventListener(
    CLICK_BODY,
    () => {
      if (resolved.body) void dispatch(new Event(resolved.body))
    },
    { target: eventTarget },
  )
  useEventListener(
    CLICK_HEAD,
    () => {
      if (resolved.head) void dispatch(new Event(resolved.head))
    },
    { target: eventTarget },
  )
}

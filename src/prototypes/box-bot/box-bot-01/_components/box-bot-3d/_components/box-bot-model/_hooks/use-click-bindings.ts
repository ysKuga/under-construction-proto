import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { ON_CLICK_BODY, ON_CLICK_HEAD } from '../index.constants'
import { useBoxBotActions } from '../index.contexts'

/**
 * 要素クリックイベント(`ON_CLICK_BODY` / `ON_CLICK_HEAD`)を、対応する action イベントへ中継する
 *
 * - bot 本体は要素押下で `ON_CLICK_*` を発行するだけ。各 action は自分の action イベントを\
 *   購読するだけ。両者の紐づけはこの hook が Context の `clickBindings` で行う
 * - どちらもこの対応表の存在を知らない = クリック元と action が疎に保たれる
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 */
export const useClickBindings = (eventTarget: EventTarget): void => {
  const dispatch = useEventDispatcher(eventTarget)
  const { clickBindings } = useBoxBotActions()

  useEventListener(
    ON_CLICK_BODY,
    () => {
      if (clickBindings.body) void dispatch(new Event(clickBindings.body))
    },
    { target: eventTarget },
  )
  useEventListener(
    ON_CLICK_HEAD,
    () => {
      if (clickBindings.head) void dispatch(new Event(clickBindings.head))
    },
    { target: eventTarget },
  )
}

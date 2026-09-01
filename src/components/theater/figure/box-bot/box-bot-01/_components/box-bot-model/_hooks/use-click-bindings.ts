import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { ON_CLICK_ELEMENT } from '../index.constants'
import { useBoxBotActions } from '../index.contexts'
import type { ClickElementDetail } from '../index.types'

/**
 * 要素クリックイベント(`ON_CLICK_ELEMENT`)を、対応する action イベントへ中継する
 *
 * - bot 本体は要素押下で `ON_CLICK_ELEMENT`(`detail` に押下要素)を発行するだけ。各 action は\
 *   自分の action イベントを購読するだけ。両者の紐づけはこの hook が Context の `clickBindings` で行う
 * - どちらもこの対応表の存在を知らない = クリック元と action が疎に保たれる
 * - 中継は 1 リスナで完結する。部位が増えても `ClickTarget` と `clickBindings` を足すだけで、\
 *   この hook は触らない
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 */
export const useClickBindings = (eventTarget: EventTarget): void => {
  const dispatch = useEventDispatcher(eventTarget)
  const { clickBindings } = useBoxBotActions()

  useEventListener<CustomEvent<ClickElementDetail>>(
    ON_CLICK_ELEMENT,
    (e) => {
      const actionEvent = clickBindings[e.detail.target]
      if (actionEvent) void dispatch(new Event(actionEvent))
    },
    { target: eventTarget },
  )
}

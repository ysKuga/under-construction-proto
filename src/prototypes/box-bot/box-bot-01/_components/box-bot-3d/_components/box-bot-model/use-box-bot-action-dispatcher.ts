import { useEventDispatcher } from '@/hooks/event'

import { BOX_BOT_ACTIONS, type BoxBotActionDispatchers } from './_actions'

/**
 * `useBoxBotActionDispatcher` の戻り値
 *
 * - レジストリ(`BOX_BOT_ACTIONS`)から自動導出する。現状は `jump` のみ
 */
export type UseBoxBotActionDispatcherReturn = BoxBotActionDispatchers<
  typeof BOX_BOT_ACTIONS
>

/**
 * box-bot-model の action を外部から実行する dispatcher
 *
 * - `ACTION_*` 定数・`Event` の組み立てを呼び出し側から隠蔽する薄いラッパー
 * - メソッドは `BOX_BOT_ACTIONS` 配列から生成する。引数は `CustomEvent.detail` で運ぶ
 * - `eventTarget` は対象 `BoxBotModel`(`BoxBot3D`)の `eventTarget` prop に\
 *   渡したものと同一インスタンスを渡す
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 */
export const useBoxBotActionDispatcher = (
  eventTarget: EventTarget,
): UseBoxBotActionDispatcherReturn => {
  const dispatch = useEventDispatcher(eventTarget)

  return Object.fromEntries(
    BOX_BOT_ACTIONS.map((action) => [
      action.name,
      (override?: unknown) =>
        dispatch(new CustomEvent(action.event, { detail: override })),
    ]),
  ) as UseBoxBotActionDispatcherReturn
}

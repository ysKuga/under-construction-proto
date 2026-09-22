import { useMemo } from 'react'

import { useEventDispatcher } from '@/hooks/event'

import {
  type AnyBoxBotAction,
  BOX_BOT_ACTIONS,
  type BoxBotActionDispatchers,
} from '../../_actions'

/**
 * `useBoxBotActionDispatcher` の既定の戻り値
 *
 * - `actions` を省略したとき(= `BOX_BOT_ACTIONS`)の型
 */
export type UseBoxBotActionDispatcherReturn = BoxBotActionDispatchers<
  typeof BOX_BOT_ACTIONS
>

/**
 * box-bot-model の action を外部から実行する dispatcher
 *
 * - `ACTION_*` 定数・`Event` の組み立てを呼び出し側から隠蔽する薄いラッパー
 * - メソッドは `actions`(既定 `BOX_BOT_ACTIONS`)から生成する。引数は `CustomEvent.detail` で運ぶ
 * - `BoxBot3D` に既定と異なる `actions` prop を渡す場合、同じ配列をここへも渡すと\
 *   dispatcher のメソッド・型がその一覧と一致する
 * - `eventTarget` は対象 `BoxBot3D` の `eventTarget` prop と同一インスタンスを渡す
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 * @param actions dispatcher を生成する対象のアクション一覧(既定 `BOX_BOT_ACTIONS`)
 */
export const useBoxBotActionDispatcher = <
  T extends readonly AnyBoxBotAction[] = typeof BOX_BOT_ACTIONS,
>(
  eventTarget: EventTarget,
  actions: T = BOX_BOT_ACTIONS as unknown as T,
): BoxBotActionDispatchers<T> => {
  const dispatch = useEventDispatcher(eventTarget)
  // 呼び出し側が actions を毎回新規配列リテラルで渡すため、参照でなく
  // action 名の列(内容)を dep にして不要な再生成を防ぐ
  const actionsKey = actions.map((action) => action.name).join('|')

  return useMemo(
    () =>
      Object.fromEntries(
        actions.map((action) => [
          action.name,
          (override?: unknown) =>
            dispatch(new CustomEvent(action.event, { detail: override })),
        ]),
      ) as BoxBotActionDispatchers<T>,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, actionsKey],
  )
}

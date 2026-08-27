import { useEventDispatcher } from '@/hooks/event'

import { BOX_BOT_ACTIONS, type BoxBotActionDispatchers } from './_actions'
import {
  ACTION_ARM_LEFT_TOGGLE,
  ACTION_ARM_RIGHT_TOGGLE,
  ACTION_FALL,
  ACTION_GET_UP,
  ACTION_HOPPING_START,
  ACTION_HOPPING_STOP,
  ACTION_MARCHING_TOGGLE,
  ACTION_WALKING_TOGGLE,
} from './index.constants'
import type { LegacyBoxBotActionDispatchers } from './index.types'

/**
 * `useBoxBotActionDispatcher` の戻り値
 *
 * - レジストリ(`BOX_BOT_ACTIONS`)分は `BoxBotActionDispatchers` で自動導出し、\
 *   未移行分(`LegacyBoxBotActionDispatchers`)と合成する
 */
export type UseBoxBotActionDispatcherReturn = BoxBotActionDispatchers<
  typeof BOX_BOT_ACTIONS
> &
  LegacyBoxBotActionDispatchers

/**
 * box-bot-model の action を外部から実行する dispatcher
 *
 * - `ACTION_*` 定数・`Event` の組み立てを呼び出し側から隠蔽する薄いラッパー
 * - レジストリ化済みアクション(`BOX_BOT_ACTIONS`)のメソッドは配列から生成する。\
 *   引数は `CustomEvent.detail` で運ぶ
 * - `eventTarget` は対象 `BoxBotModel`(`BoxBot3D`)の `eventTarget` prop に\
 *   渡したものと同一インスタンスを渡す
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 */
export const useBoxBotActionDispatcher = (
  eventTarget: EventTarget,
): UseBoxBotActionDispatcherReturn => {
  const dispatch = useEventDispatcher(eventTarget)

  const registry = Object.fromEntries(
    BOX_BOT_ACTIONS.map((action) => [
      action.name,
      (override?: unknown) =>
        dispatch(new CustomEvent(action.event, { detail: override })),
    ]),
  ) as BoxBotActionDispatchers<typeof BOX_BOT_ACTIONS>

  return {
    ...registry,
    armLeftToggle: () => dispatch(new Event(ACTION_ARM_LEFT_TOGGLE)),
    armRightToggle: () => dispatch(new Event(ACTION_ARM_RIGHT_TOGGLE)),
    fall: () => dispatch(new Event(ACTION_FALL)),
    getUp: () => dispatch(new Event(ACTION_GET_UP)),
    hoppingStart: () => dispatch(new Event(ACTION_HOPPING_START)),
    hoppingStop: () => dispatch(new Event(ACTION_HOPPING_STOP)),
    marchingToggle: () => dispatch(new Event(ACTION_MARCHING_TOGGLE)),
    walkingToggle: () => dispatch(new Event(ACTION_WALKING_TOGGLE)),
  }
}

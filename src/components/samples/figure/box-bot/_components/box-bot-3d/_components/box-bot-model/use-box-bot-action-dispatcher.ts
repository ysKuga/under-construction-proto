import { useEventDispatcher } from '@/hooks/event'

import {
  ACTION_ARM_LEFT_TOGGLE,
  ACTION_ARM_RIGHT_TOGGLE,
  ACTION_JUMP,
} from './index.constants'
import type { UseBoxBotActionDispatcherReturn } from './index.types'

/**
 * box-bot-model の action を外部から実行する dispatcher
 *
 * - `ACTION_*` 定数・`Event` の組み立てを呼び出し側から隠蔽する薄いラッパー
 * - `eventTarget` は対象 `BoxBotModel`(`BoxBot3D`)の `eventTarget` prop に\
 *   渡したものと同一インスタンスを渡す
 *
 * @param eventTarget box-bot-model と共有する EventTarget
 */
export const useBoxBotActionDispatcher = (
  eventTarget: EventTarget,
): UseBoxBotActionDispatcherReturn => {
  const dispatch = useEventDispatcher(eventTarget)

  return {
    armLeftToggle: () => dispatch(new Event(ACTION_ARM_LEFT_TOGGLE)),
    armRightToggle: () => dispatch(new Event(ACTION_ARM_RIGHT_TOGGLE)),
    jump: () => dispatch(new Event(ACTION_JUMP)),
  }
}

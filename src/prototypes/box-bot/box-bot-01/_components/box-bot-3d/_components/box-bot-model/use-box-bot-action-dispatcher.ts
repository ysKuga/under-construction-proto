import { useEventDispatcher } from '@/hooks/event'

import {
  ACTION_ARM_LEFT_TOGGLE,
  ACTION_ARM_RIGHT_TOGGLE,
  ACTION_FALL,
  ACTION_GET_UP,
  ACTION_HOPPING_START,
  ACTION_HOPPING_STOP,
  ACTION_JUMP,
  ACTION_MARCHING_TOGGLE,
  ACTION_WALKING_TOGGLE,
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
    fall: () => dispatch(new Event(ACTION_FALL)),
    getUp: () => dispatch(new Event(ACTION_GET_UP)),
    hoppingStart: () => dispatch(new Event(ACTION_HOPPING_START)),
    hoppingStop: () => dispatch(new Event(ACTION_HOPPING_STOP)),
    jump: () => dispatch(new Event(ACTION_JUMP)),
    marchingToggle: () => dispatch(new Event(ACTION_MARCHING_TOGGLE)),
    walkingToggle: () => dispatch(new Event(ACTION_WALKING_TOGGLE)),
  }
}

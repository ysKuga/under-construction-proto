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

  /** action の event を発行する(実行拒否の判定は使わないため、dispatch の戻り値は捨てる) */
  const dispatchAction = async (type: string) => {
    await dispatch(new Event(type))
  }

  return {
    armLeftToggle: () => dispatchAction(ACTION_ARM_LEFT_TOGGLE),
    armRightToggle: () => dispatchAction(ACTION_ARM_RIGHT_TOGGLE),
    fall: () => dispatchAction(ACTION_FALL),
    getUp: () => dispatchAction(ACTION_GET_UP),
    hoppingStart: () => dispatchAction(ACTION_HOPPING_START),
    hoppingStop: () => dispatchAction(ACTION_HOPPING_STOP),
    jump: () => dispatchAction(ACTION_JUMP),
    marchingToggle: () => dispatchAction(ACTION_MARCHING_TOGGLE),
    walkingToggle: () => dispatchAction(ACTION_WALKING_TOGGLE),
  }
}

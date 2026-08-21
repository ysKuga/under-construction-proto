import {
  ACTION_ARM_LEFT_TOGGLE,
  ACTION_ARM_RIGHT_TOGGLE,
} from '../../index.constants'
import { useBoxBotEventTarget } from '../../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../../index.types'

import { useArmToggle } from './_hooks/use-arm-toggle'

/**
 * 左右の腕の action(現状は上げ下げ toggle のみ)の発火・購読
 *
 * - 左右で共通のロジック(`useArmToggle`)を `BoxBot-action-arm-left-toggle`/`BoxBot-action-arm-right-toggle`\
 *   それぞれのイベント名で個別に呼び出す
 *
 * @param props BoxBotModel に渡される props
 */
export const useArmAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'arm'> => {
  const { interactive = true } = props

  const eventTarget = useBoxBotEventTarget()
  const left = useArmToggle(interactive, eventTarget, ACTION_ARM_LEFT_TOGGLE)
  const right = useArmToggle(interactive, eventTarget, ACTION_ARM_RIGHT_TOGGLE)

  return { arm: { left, right } }
}

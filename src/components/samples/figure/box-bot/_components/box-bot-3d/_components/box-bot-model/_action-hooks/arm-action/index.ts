import {
  TOGGLE_LEFT_EVENT_TYPE,
  TOGGLE_RIGHT_EVENT_TYPE,
} from '../../index.constants'
import { useBoxBotEventTarget } from '../../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../../index.types'

import { useArmToggle } from './_hooks/use-arm-toggle'

/**
 * 左右の腕の action(現状は上げ下げ toggle のみ)の発火・購読
 *
 * - 左右で共通のロジック(`useArmToggle`)を `BoxBot-toggle-left`/`BoxBot-toggle-right`\
 *   それぞれのイベント名で個別に呼び出す
 *
 * @param props BoxBotModel に渡される props
 */
export const useArmAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'arm'> => {
  const { interactive = true } = props

  const eventTarget = useBoxBotEventTarget()
  const left = useArmToggle(interactive, eventTarget, TOGGLE_LEFT_EVENT_TYPE)
  const right = useArmToggle(interactive, eventTarget, TOGGLE_RIGHT_EVENT_TYPE)

  return { arm: { left, right } }
}

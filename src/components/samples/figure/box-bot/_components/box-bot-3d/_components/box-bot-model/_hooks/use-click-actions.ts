import type { ThreeEvent } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { ACTION_JUMP, CLICK_BODY, CLICK_HEAD } from '../index.constants'
import { useBoxBotEventTarget } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/** click イベント → action イベントの既定対応 */
const DEFAULT_CLICK_ACTION_MAP: Required<
  NonNullable<BoxBotModelProps['clickActionMap']>
> = {
  body: ACTION_JUMP,
  head: ACTION_JUMP,
}

/**
 * 要素クリックの発火・action への変換
 *
 * - body/head クリックは `CLICK_BODY`/`CLICK_HEAD` を dispatch するだけに徹する。\
 *   どの action(jump 等)を実行するかは `clickActionMap` prop(省略時は\
 *   `DEFAULT_CLICK_ACTION_MAP`)側の対応で決まるため、要素の意味(どこをクリックしたか)と\
 *   実行される action(jumpAction 等)が分離される
 * - `interactive` による制御は実行側(各 action hook)で行う。クリックハンドラ自体は常に登録し、\
 *   `stopPropagation`(クリック伝播の抑止)は interactive に関わらず必要なため
 *
 * @param props BoxBotModel に渡される props
 */
export const useClickActions = (
  props: Pick<BoxBotModelProps, 'clickActionMap'>,
): Pick<UseBoxBotModelReturn, 'clickBody' | 'clickHead'> => {
  const bodyAction = props.clickActionMap?.body ?? DEFAULT_CLICK_ACTION_MAP.body
  const headAction = props.clickActionMap?.head ?? DEFAULT_CLICK_ACTION_MAP.head

  const eventTarget = useBoxBotEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  useEventListener(CLICK_BODY, () => void dispatch(new Event(bodyAction)), {
    target: eventTarget,
  })
  useEventListener(CLICK_HEAD, () => void dispatch(new Event(headAction)), {
    target: eventTarget,
  })

  const clickBody = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(new Event(CLICK_BODY))
  }
  const clickHead = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(new Event(CLICK_HEAD))
  }

  return { clickBody, clickHead }
}

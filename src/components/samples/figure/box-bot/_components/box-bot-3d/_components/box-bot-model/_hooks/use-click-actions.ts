import type { ThreeEvent } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import {
  ACTION_ARM_LEFT_TOGGLE,
  ACTION_ARM_RIGHT_TOGGLE,
  ACTION_JUMP,
  CLICK_ARM_LEFT,
  CLICK_ARM_RIGHT,
  CLICK_BODY,
  CLICK_BODY_RELEASE,
  CLICK_HEAD,
  CLICK_HEAD_RELEASE,
} from '../index.constants'
import { useBoxBotEventTarget } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/** click イベント → action イベントの既定対応 */
const DEFAULT_CLICK_ACTION_MAP: Required<
  NonNullable<BoxBotModelProps['clickActionMap']>
> = {
  armLeft: ACTION_ARM_LEFT_TOGGLE,
  armRight: ACTION_ARM_RIGHT_TOGGLE,
  body: ACTION_JUMP,
  head: ACTION_JUMP,
}

/**
 * 要素クリックの発火・action への変換
 *
 * - body/head/arm クリックは `CLICK_BODY`/`CLICK_HEAD`/`CLICK_ARM_LEFT`/`CLICK_ARM_RIGHT`\
 *   を dispatch するだけに徹する。どの action(jump/arm-toggle 等)を実行するかは\
 *   `clickActionMap` prop(省略時は `DEFAULT_CLICK_ACTION_MAP`)側の対応で決まるため、\
 *   要素の意味(どこをクリックしたか)と実行される action が分離される
 * - `interactive` による制御は実行側(各 action hook)で行う。クリックハンドラ自体は常に登録し、\
 *   `stopPropagation`(クリック伝播の抑止)は interactive に関わらず必要なため
 * - body/head は `onClick`(mouseup 後)でなく `onPointerDown` として呼び出す想定。\
 *   Pointer Events は mouse/touch 統合のため、クリックに伴うページ遷移(not-found → home)\
 *   より早いタイミングで action(spin 等)を起動でき、遷移までのリード時間を確保できる
 * - `CLICK_BODY_RELEASE`/`CLICK_HEAD_RELEASE`(pointer up/out)は `clickActionMap` を経由せず、\
 *   `use-spin-action` が押下継続判定のため直接購読する。他 action(jump 等)には「離す」概念が\
 *   無いため、対応表を介さない非対称な扱いにしている
 *
 * @param props BoxBotModel に渡される props
 */
export const useClickActions = (
  props: Pick<BoxBotModelProps, 'clickActionMap'>,
): Pick<
  UseBoxBotModelReturn,
  | 'clickArmLeft'
  | 'clickArmRight'
  | 'clickBody'
  | 'clickHead'
  | 'releaseBody'
  | 'releaseHead'
> => {
  const armLeftAction =
    props.clickActionMap?.armLeft ?? DEFAULT_CLICK_ACTION_MAP.armLeft
  const armRightAction =
    props.clickActionMap?.armRight ?? DEFAULT_CLICK_ACTION_MAP.armRight
  const bodyAction = props.clickActionMap?.body ?? DEFAULT_CLICK_ACTION_MAP.body
  const headAction = props.clickActionMap?.head ?? DEFAULT_CLICK_ACTION_MAP.head

  const eventTarget = useBoxBotEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  useEventListener(CLICK_BODY, () => void dispatch(bodyAction), {
    target: eventTarget,
  })
  useEventListener(CLICK_HEAD, () => void dispatch(headAction), {
    target: eventTarget,
  })
  useEventListener(CLICK_ARM_LEFT, () => void dispatch(armLeftAction), {
    target: eventTarget,
  })
  useEventListener(CLICK_ARM_RIGHT, () => void dispatch(armRightAction), {
    target: eventTarget,
  })

  const clickBody = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    void dispatch(CLICK_BODY)
  }
  const clickHead = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    void dispatch(CLICK_HEAD)
  }
  const clickArmLeft = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(CLICK_ARM_LEFT)
  }
  const clickArmRight = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(CLICK_ARM_RIGHT)
  }
  const releaseBody = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    void dispatch(CLICK_BODY_RELEASE)
  }
  const releaseHead = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    void dispatch(CLICK_HEAD_RELEASE)
  }

  return {
    clickArmLeft,
    clickArmRight,
    clickBody,
    clickHead,
    releaseBody,
    releaseHead,
  }
}

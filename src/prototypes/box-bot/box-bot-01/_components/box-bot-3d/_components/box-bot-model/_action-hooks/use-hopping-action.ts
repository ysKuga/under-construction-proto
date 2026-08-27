import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import {
  ACTION_HOPPING_START,
  ACTION_HOPPING_STOP,
  HOPPING_INTERVAL,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * hopping(待機演出、bot への hover/touch 中・回転中以外は連続ジャンプ)の購読・可視化
 *
 * - `BoxBot-action-hopping-start`/`-stop` の受信(`hoppingRef` の切替)を\
 *   `useEventListener` で行う。`ACTION_JUMP`(クリック起点の単発ジャンプ)とは\
 *   独立した action として扱い、hopping 状態でない box-bot には一切影響しない\
 *   (`hoppingRef` の既定値は false)
 * - ジャンプの見た目自体は既存 `useJumpAction`(`jumpRef`)を再利用する。ここでは\
 *   `jumpRef` が非アクティブ(-1)になった後 `HOPPING_INTERVAL` 秒待って次の\
 *   ジャンプを起動する「トリガー」のみを担う
 * - `botHoverRef`(bot への hover/touch)・`spinActionRef`(回転 action 実行中)の\
 *   いずれかが真の間は停止し、収まれば自動的に再開する
 *
 * @param props BoxBotModel に渡される props
 */
export const useHoppingAction = (
  props: Pick<BoxBotModelProps, 'interactive'>,
): void => {
  const { interactive = true } = props

  const {
    botHoverRef,
    hoppingCooldownRef,
    hoppingRef,
    jumpRef,
    spinActionRef,
  } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  useEventListener(
    ACTION_HOPPING_START,
    () => {
      hoppingRef.current = true
    },
    { target: eventTarget },
  )
  useEventListener(
    ACTION_HOPPING_STOP,
    () => {
      hoppingRef.current = false
    },
    { target: eventTarget },
  )

  useFrame((_, dt) => {
    if (!interactive) return

    const active =
      hoppingRef.current && !botHoverRef.current && spinActionRef.current < 0

    if (!active) {
      hoppingCooldownRef.current = -1
      return
    }

    if (jumpRef.current >= 0) return

    if (hoppingCooldownRef.current < 0) {
      hoppingCooldownRef.current = 0
      return
    }

    hoppingCooldownRef.current += dt
    if (hoppingCooldownRef.current >= HOPPING_INTERVAL) {
      jumpRef.current = 0
      hoppingCooldownRef.current = -1
    }
  })
}

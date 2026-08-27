import { useFrame } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { ACTION_JUMP } from '../_actions/jump/config'
import {
  ACTION_HOPPING_START,
  ACTION_HOPPING_STOP,
  HOPPING_INTERVAL,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBot3DConfig, BoxBotModelProps } from '../index.types'

/**
 * hopping(待機演出、bot への hover/touch 中・回転中以外は連続ジャンプ)の購読・可視化
 *
 * - `BoxBot-action-hopping-start`/`-stop` の受信(`hoppingRef` の切替)を\
 *   `useEventListener` で行う。`hoppingRef` の既定値は false のため、hopping 状態でない\
 *   box-bot には一切影響しない
 * - ジャンプの見た目自体は jump アクション(`_actions/jump`)を再利用する。ここでは\
 *   `ACTION_JUMP` を一定間隔で dispatch する「トリガー」のみを担い、jump の内部 ref には触れない\
 *   (アクション間の内部依存を持たない)
 * - 次の dispatch までの間隔は `cfg.jump.durSec + HOPPING_INTERVAL`(1 回のジャンプが\
 *   終わってから `HOPPING_INTERVAL` 秒空ける相当)
 * - `botHoverRef`(bot への hover/touch)・`spinActionRef`(回転 action 実行中)の\
 *   いずれかが真の間は停止し、収まれば自動的に再開する
 *
 * @param props BoxBotModel に渡される props
 * @param cfg マージ済みの設定値(`jump.durSec` を間隔計算に使う)
 */
export const useHoppingAction = (
  props: Pick<BoxBotModelProps, 'interactive'>,
  cfg: BoxBot3DConfig,
): void => {
  const { interactive = true } = props

  const { botHoverRef, hoppingCooldownRef, hoppingRef, spinActionRef } =
    useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

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

    if (hoppingCooldownRef.current < 0) hoppingCooldownRef.current = 0
    hoppingCooldownRef.current += dt
    if (hoppingCooldownRef.current >= cfg.jump.durSec + HOPPING_INTERVAL) {
      void dispatch(new Event(ACTION_JUMP))
      hoppingCooldownRef.current = 0
    }
  })
}

import { useFrame } from '@react-three/fiber'

import { CONTINUOUS_JUMP_INTERVAL } from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * 待機演出(bot への hover/touch 中・回転中以外は常にジャンプを繰り返す)
 *
 * - PC/モバイル問わず常時アクティブ。`botHoverRef`(bot 自体への hover/touch)・\
 *   `spinActionRef`(回転 action 実行中)のいずれかが真の間だけ停止し、\
 *   どちらも収まれば自動的に再開する
 * - `jumpRef` が非アクティブ(-1)になった後、`CONTINUOUS_JUMP_INTERVAL` 秒待って次の\
 *   ジャンプを起動する。ジャンプ自体の進行(`jumpRef` の消化)は `useJumpAction` 側が行う
 *
 * @param props BoxBotModel に渡される props
 */
export const useContinuousJumpAction = (
  props: Pick<BoxBotModelProps, 'interactive'>,
): void => {
  const { interactive = true } = props

  const { botHoverRef, continuousJumpCooldownRef, jumpRef, spinActionRef } =
    useBoxBotRefs()

  useFrame((_, dt) => {
    if (!interactive) return

    const active = !botHoverRef.current && spinActionRef.current < 0

    if (!active) {
      continuousJumpCooldownRef.current = -1
      return
    }

    if (jumpRef.current >= 0) return

    if (continuousJumpCooldownRef.current < 0) {
      continuousJumpCooldownRef.current = 0
      return
    }

    continuousJumpCooldownRef.current += dt
    if (continuousJumpCooldownRef.current >= CONTINUOUS_JUMP_INTERVAL) {
      jumpRef.current = 0
      continuousJumpCooldownRef.current = -1
    }
  })
}

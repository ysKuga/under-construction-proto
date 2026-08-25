import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { CONTINUOUS_JUMP_INTERVAL } from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/** hover 可能な環境(PC 等)かどうか。モバイル(タッチのみ)は hover 概念が無いため false */
const isHoverCapable = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches

/**
 * 待機演出(bot 以外にポインタがある間、ジャンプを繰り返す)
 *
 * - PC(hover 可能な環境): `canvasHoverRef`(Canvas 内、bot 以外を含む)が true かつ\
 *   `botHoverRef`(bot 自体への hover/touch)が false の間、アクティブにする
 * - モバイル(hover 不可な環境): `canvasHoverRef` を見ず、`botHoverRef` が false の間\
 *   常時アクティブにする(hover 概念が無く、ページ表示中ずっと演出させたいため)
 * - `jumpRef` が非アクティブ(-1)になった後、`CONTINUOUS_JUMP_INTERVAL` 秒待って次の\
 *   ジャンプを起動する。ジャンプ自体の進行(`jumpRef` の消化)は `useJumpAction` 側が行う
 *
 * @param props BoxBotModel に渡される props
 */
export const useContinuousJumpAction = (
  props: Pick<BoxBotModelProps, 'canvasHoverRef' | 'interactive'>,
): void => {
  const { canvasHoverRef, interactive = true } = props

  const { botHoverRef, continuousJumpCooldownRef, jumpRef } = useBoxBotRefs()

  const [hoverCapable] = React.useState(isHoverCapable)

  useFrame((_, dt) => {
    if (!interactive) return

    const active = botHoverRef.current
      ? false
      : hoverCapable
        ? (canvasHoverRef?.current ?? false)
        : true

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

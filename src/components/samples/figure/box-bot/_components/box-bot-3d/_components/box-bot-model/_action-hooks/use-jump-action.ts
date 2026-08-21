import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as React from 'react'
import type { Group } from 'three'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import {
  ACTION_JUMP,
  JUMP_DUR,
  JUMP_H,
  JUMP_SQUASH_X,
  JUMP_SQUASH_Y,
} from '../index.constants'
import { useBoxBotEventTarget } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * ジャンプ action の発火・購読・可視化
 *
 * - クリック(`startJump`)は `BoxBot-action-jump` イベントを dispatch するだけに徹し、\
 *   実際の実行(`jumpRef` の起動)は `useEventListener` 側で行う。外部からの\
 *   `useEventListener` 経由の発火も同じ経路を通るため、実行判定が一本化される
 * - `interactive` による制御も実行側(`jumpAction`)で行う。`onClick` 自体は\
 *   常に登録し、`stopPropagation`(クリック伝播の抑止)は interactive に関わらず必要なため
 * - ジャンプ中の `rootRef`(全体グループ)の位置・スケール制御も本 hook 内の `useFrame` で完結させる
 *
 * @param props BoxBotModel に渡される props
 */
export const useJumpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'jumpRef' | 'rootRef' | 'startJump'> => {
  const { interactive } = props

  const jumpRef = React.useRef(-1)
  const rootRef = React.useRef<Group>(null)
  const eventTarget = useBoxBotEventTarget()

  const jumpAction = () => {
    if (!interactive) return
    if (jumpRef.current < 0) jumpRef.current = 0
  }

  const dispatch = useEventDispatcher(eventTarget)
  useEventListener(ACTION_JUMP, jumpAction, { target: eventTarget })

  const startJump = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(new Event(ACTION_JUMP))
  }

  // ジャンプ進行度に応じた rootRef の位置・スケール更新
  useFrame((_, dt) => {
    if (!rootRef.current) return

    let sx = 1,
      sy = 1,
      y = 0
    if (jumpRef.current >= 0) {
      jumpRef.current += dt
      if (jumpRef.current >= JUMP_DUR) {
        jumpRef.current = -1
      } else {
        const p = jumpRef.current / JUMP_DUR
        y = Math.sin(p * Math.PI) * JUMP_H
        sy = 1 + JUMP_SQUASH_Y * Math.sin(p * Math.PI * 2)
        sx = 1 - JUMP_SQUASH_X * Math.sin(p * Math.PI * 2)
      }
    }
    rootRef.current.position.y = y
    rootRef.current.scale.set(sx, sy, sx)
  })

  return { jumpRef, rootRef, startJump }
}

import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import {
  ACTION_JUMP,
  JUMP_DUR,
  JUMP_H,
  JUMP_SQUASH_X,
  JUMP_SQUASH_Y,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * ジャンプ action の購読・可視化
 *
 * - `BoxBot-action-jump` イベントの受信(`jumpRef` の起動)を `useEventListener` で行う。\
 *   クリック起点(`clickBody`/`clickHead`、`useClickActions`)・外部起点\
 *   (`useBoxBotActionDispatcher`)いずれも同じイベントを dispatch するため、実行判定が一本化される
 * - `interactive` による制御も実行側(`jumpAction`)で行う
 * - ジャンプ中の `rootRef`(全体グループ)の位置・スケール制御も本 hook 内の `useFrame` で完結させる。\
 *   `jumpRef`/`rootRef` 自体は `BoxBotRefsProvider` が生成し `useBoxBotRefs` 経由で取得する
 *
 * @param props BoxBotModel に渡される props
 */
export const useJumpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): void => {
  const { interactive } = props

  const { jumpRef, rootRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const jumpAction = () => {
    if (!interactive) return
    if (jumpRef.current < 0) jumpRef.current = 0
  }

  useEventListener(ACTION_JUMP, jumpAction, { target: eventTarget })

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
}

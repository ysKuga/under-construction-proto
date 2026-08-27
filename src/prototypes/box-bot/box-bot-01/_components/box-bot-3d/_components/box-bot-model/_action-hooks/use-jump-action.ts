import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import {
  ACTION_JUMP,
  JUMP_DUR,
  JUMP_LIFT_PX,
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
 * - 縦移動は表示領域(`jumpLiftRef` = Canvas ラッパー DOM)の transform 書き換えで行い、\
 *   Canvas 内では squash(`rootRef` の scale)のみ制御する(#108)。\
 *   `jumpRef`/`rootRef` 自体は `BoxBotRefsProvider` が生成し `useBoxBotRefs` 経由で取得する
 *
 * @param props BoxBotModel に渡される props
 */
export const useJumpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): void => {
  const { interactive, jumpLiftRef } = props

  const { jumpRef, rootRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const jumpAction = () => {
    if (!interactive) return
    if (jumpRef.current < 0) jumpRef.current = 0
  }

  useEventListener(ACTION_JUMP, jumpAction, { target: eventTarget })

  // ジャンプ進行度に応じた squash(rootRef の scale)と表示領域の持ち上げ(jumpLiftRef)更新
  useFrame((_, dt) => {
    if (!rootRef.current) return

    let lift = 0,
      sx = 1,
      sy = 1
    if (jumpRef.current >= 0) {
      jumpRef.current += dt
      if (jumpRef.current >= JUMP_DUR) {
        jumpRef.current = -1
      } else {
        const p = jumpRef.current / JUMP_DUR
        lift = Math.sin(p * Math.PI) * JUMP_LIFT_PX
        sy = 1 + JUMP_SQUASH_Y * Math.sin(p * Math.PI * 2)
        sx = 1 - JUMP_SQUASH_X * Math.sin(p * Math.PI * 2)
      }
    }
    rootRef.current.scale.set(sx, sy, sx)
    // 表示領域ラッパーの基準 transform(translate(-50%, -50%))へジャンプ分を合成する
    if (jumpLiftRef?.current) {
      jumpLiftRef.current.style.transform = `translate(-50%, calc(-50% - ${lift}px))`
    }
  })
}

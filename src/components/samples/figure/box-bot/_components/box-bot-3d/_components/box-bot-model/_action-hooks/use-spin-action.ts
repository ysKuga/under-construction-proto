import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import { ACTION_SPIN, SPIN_DUR } from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * 回転(1回転して停止)action の購読・可視化
 *
 * - `BoxBot-action-spin` イベントの受信(`spinActionRef` の起動)を `useEventListener` で行う。\
 *   クリック起点(`clickBody`/`clickHead`、`useClickActions`)・外部起点\
 *   (`useBoxBotActionDispatcher`)いずれも同じイベントを dispatch するため、実行判定が一本化される
 * - `interactive` による制御も実行側(`spinAction`)で行う
 * - `spinRef` の回転は `useAutoRotateAction` と同じ「増分加算」方式にし、`autoRotate` 有効時でも\
 *   互いの回転量を打ち消さず合算されるようにする
 *
 * @param props BoxBotModel に渡される props
 */
export const useSpinAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): void => {
  const { interactive } = props

  const { spinActionRef, spinRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const spinAction = () => {
    if (!interactive) return
    if (spinActionRef.current < 0) spinActionRef.current = 0
  }

  useEventListener(ACTION_SPIN, spinAction, { target: eventTarget })

  useFrame((_, dt) => {
    if (spinActionRef.current < 0 || !spinRef.current) return

    spinActionRef.current += dt
    if (spinActionRef.current >= SPIN_DUR) {
      spinActionRef.current = -1
      return
    }

    const angularSpeed = (Math.PI * 2) / SPIN_DUR
    spinRef.current.rotation.y += angularSpeed * dt
  })
}

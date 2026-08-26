import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import {
  ACTION_SPIN,
  ACTION_SPIN_STOP,
  CLICK_BODY_RELEASE,
  CLICK_HEAD_RELEASE,
  SPIN_ACCEL_DUR,
  SPIN_DECEL_DUR,
  SPIN_MAX_SPEED,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * 押下継続中の角速度(rad/s)を経過時間(秒)から求める
 *
 * - 加速 → 最大速度維持、の2フェーズ。押下中は巡航に上限時間を設けず維持し続ける
 *
 * @param t 起動からの経過時間(秒)
 */
const angularSpeedWhileHeld = (t: number): number =>
  t < SPIN_ACCEL_DUR ? (SPIN_MAX_SPEED / SPIN_ACCEL_DUR) * t : SPIN_MAX_SPEED

/**
 * 回転(加速→押下中は最大速度維持→解放で減速→停止)action の購読・可視化
 *
 * - `BoxBot-action-spin` イベントの受信(`spinActionRef` の起動・`spinHeldRef` の起動)を\
 *   `useEventListener` で行う。クリック起点(`clickBody`/`clickHead`、`useClickActions`)・\
 *   外部起点(`useBoxBotActionDispatcher`)いずれも同じイベントを dispatch するため、\
 *   実行判定が一本化される
 * - `CLICK_BODY_RELEASE`/`CLICK_HEAD_RELEASE`(pointer up/out、要素起点)・`ACTION_SPIN_STOP`\
 *   (hover 共通の onPointerOut 起点)いずれの受信でも `spinHeldRef` を解除する。\
 *   `clickActionMap` を経由しない直接購読(`useClickActions` 側の設計メモ参照)
 * - `interactive` による制御も実行側(`spinAction`)で行う
 * - 押下中は `angularSpeedWhileHeld` で加速後 `SPIN_MAX_SPEED` を維持し続け、減速しない。\
 *   `spinActionRef` は押下中のみ加算し、解放時点の値で凍結する(離した瞬間の角速度を\
 *   `angularSpeedWhileHeld(spinActionRef.current)` で再計算できるようにするため)
 * - 解放後は `spinReleaseElapsedRef` の経過時間で、離した瞬間の角速度から 0 まで\
 *   `SPIN_DECEL_DUR` かけて線形減速する
 * - `spinRef` の回転は `useAutoRotateAction` と同じ「増分加算」方式にし、`autoRotate` 有効時でも\
 *   互いの回転量を打ち消さず合算されるようにする
 *
 * @param props BoxBotModel に渡される props
 */
export const useSpinAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): void => {
  const { interactive } = props

  const { spinActionRef, spinHeldRef, spinRef, spinReleaseElapsedRef } =
    useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const spinAction = () => {
    if (!interactive) return
    spinHeldRef.current = true
    if (spinActionRef.current < 0) spinActionRef.current = 0
  }
  const spinReleaseAction = () => {
    spinHeldRef.current = false
  }

  useEventListener(ACTION_SPIN, spinAction, { target: eventTarget })
  useEventListener(CLICK_BODY_RELEASE, spinReleaseAction, {
    target: eventTarget,
  })
  useEventListener(CLICK_HEAD_RELEASE, spinReleaseAction, {
    target: eventTarget,
  })
  useEventListener(ACTION_SPIN_STOP, spinReleaseAction, {
    target: eventTarget,
  })

  useFrame((_, dt) => {
    if (spinActionRef.current < 0 || !spinRef.current) return

    if (spinHeldRef.current) {
      spinActionRef.current += dt
      spinRef.current.rotation.y +=
        angularSpeedWhileHeld(spinActionRef.current) * dt
      return
    }

    spinReleaseElapsedRef.current =
      spinReleaseElapsedRef.current < 0 ? 0 : spinReleaseElapsedRef.current + dt

    if (spinReleaseElapsedRef.current >= SPIN_DECEL_DUR) {
      spinActionRef.current = -1
      spinReleaseElapsedRef.current = -1
      return
    }

    const releaseVel = angularSpeedWhileHeld(spinActionRef.current)
    const decelSpeed =
      releaseVel * (1 - spinReleaseElapsedRef.current / SPIN_DECEL_DUR)
    spinRef.current.rotation.y += decelSpeed * dt
  })
}

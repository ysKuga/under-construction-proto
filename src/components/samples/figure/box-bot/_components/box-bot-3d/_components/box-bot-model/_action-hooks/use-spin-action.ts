import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import {
  ACTION_SPIN,
  SPIN_ACCEL_RATE,
  SPIN_CRUISE_DUR,
  SPIN_DECEL_RATE,
  SPIN_MAX_SPEED,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/** 加速フェーズの所要時間(秒)。0 から `SPIN_MAX_SPEED` まで加速するのにかかる時間 */
const ACCEL_DUR = SPIN_MAX_SPEED / SPIN_ACCEL_RATE
/** 減速フェーズの所要時間(秒)。`SPIN_MAX_SPEED` から 0 まで減速するのにかかる時間 */
const DECEL_DUR = SPIN_MAX_SPEED / SPIN_DECEL_RATE
/** 加速開始から停止までの合計時間(秒)。加速度・減速度・巡航時間から決まるため固定値ではない */
const TOTAL_DUR = ACCEL_DUR + SPIN_CRUISE_DUR + DECEL_DUR

/**
 * 経過時間(秒)から現在の角速度(rad/s)を求める
 *
 * - 加速 → 最大速度維持(巡航) → 減速、の台形速度プロファイル
 *
 * @param t 起動からの経過時間(秒)
 */
const angularSpeedAt = (t: number): number => {
  if (t < ACCEL_DUR) return SPIN_ACCEL_RATE * t
  if (t < ACCEL_DUR + SPIN_CRUISE_DUR) return SPIN_MAX_SPEED
  return SPIN_MAX_SPEED - SPIN_DECEL_RATE * (t - (ACCEL_DUR + SPIN_CRUISE_DUR))
}

/**
 * 回転(加速→最大速度→減速→停止)action の購読・可視化
 *
 * - `BoxBot-action-spin` イベントの受信(`spinActionRef` の起動)を `useEventListener` で行う。\
 *   クリック起点(`clickBody`/`clickHead`、`useClickActions`)・外部起点\
 *   (`useBoxBotActionDispatcher`)いずれも同じイベントを dispatch するため、実行判定が一本化される
 * - `interactive` による制御も実行側(`spinAction`)で行う
 * - 角速度は経過時間から `angularSpeedAt` で解析的に求める(台形速度プロファイル)。\
 *   合計時間(`TOTAL_DUR`)は加速度・減速度・巡航時間の設定次第で変わるため固定しない
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
    if (spinActionRef.current >= TOTAL_DUR) {
      spinActionRef.current = -1
      return
    }

    spinRef.current.rotation.y += angularSpeedAt(spinActionRef.current) * dt
  })
}

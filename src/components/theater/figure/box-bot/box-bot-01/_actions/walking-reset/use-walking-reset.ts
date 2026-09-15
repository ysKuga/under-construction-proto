import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import { ACTION_WALKING_RESET } from './config'

/** walkingReset が host から必要とする操作面 */
type WalkingResetHost = Pick<
  BoxBotActionContext<never>,
  | 'applyArmSwing'
  | 'applyLegSwing'
  | 'eventTarget'
  | 'readArmSwing'
  | 'readLegSwing'
>

/**
 * 歩行の腕・脚を規定位置(0)へ戻す action の購読・可視化
 *
 * - `walking` の自然減衰(`settleRate`)を待たず、dispatch 時点の角度から 0 へ\
 *   指定時間(`durationMs`)かけて線形補間する。到着タイミングに正確に揃えたい\
 *   呼び出し側(stage-07 の到着直前 dispatch 等)向け
 * - dispatch 引数(`durationMs`)省略時、または `0` 以下なら即座に 0 へスナップする
 * - `walking` 側もこのイベントを購読し、`activeRef` を off にしたうえで自身の\
 *   `useFrame` を沈黙させる(`use-walking.ts`)。そうしないと、この action が書いた\
 *   補間値を `walking` の自然減衰処理が同じフレームで上書きしてしまう
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useWalkingReset = (host: WalkingResetHost): void => {
  const {
    applyArmSwing,
    applyLegSwing,
    eventTarget,
    readArmSwing,
    readLegSwing,
  } = host

  /** 補間の残り時間(ms)。0 以下なら非活性 */
  const remainingMsRef = useRef(0)
  /** 補間の総時間(ms) */
  const durationMsRef = useRef(0)
  /** 補間開始時点の脚角 */
  const startLegRef = useRef({ left: 0, right: 0 })
  /** 補間開始時点の腕角 */
  const startArmRef = useRef({ left: 0, right: 0 })

  const onWalkingReset = (event: CustomEvent<number | undefined>) => {
    const durationMs = event.detail ?? 0

    if (durationMs <= 0) {
      applyLegSwing({ left: 0, right: 0 })
      applyArmSwing({ left: 0, right: 0 })
      remainingMsRef.current = 0
      return
    }

    startLegRef.current = readLegSwing()
    startArmRef.current = readArmSwing()
    durationMsRef.current = durationMs
    remainingMsRef.current = durationMs
  }

  useEventListener<CustomEvent<number | undefined>>(
    ACTION_WALKING_RESET,
    onWalkingReset,
    // `walking` action(`use-walking.ts`)も同じイベントを購読するため許可
    { allowMultiple: true, target: eventTarget },
  )

  useFrame((_, dt) => {
    if (remainingMsRef.current <= 0) return

    remainingMsRef.current -= dt * 1000
    // 0(補間開始)→1(完了)へ進む係数。残り時間がマイナスに振れても 1 で頭打ちにする
    const progress =
      1 - Math.max(0, remainingMsRef.current) / durationMsRef.current

    applyLegSwing({
      left: startLegRef.current.left * (1 - progress),
      right: startLegRef.current.right * (1 - progress),
    })
    applyArmSwing({
      left: startArmRef.current.left * (1 - progress),
      right: startArmRef.current.right * (1 - progress),
    })
  })
}

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import { ACTION_SPIN, type SpinConfig, type SpinOverride } from './config'

/** spin が host から必要とする操作面 */
type SpinHost = Pick<
  BoxBotActionContext<SpinConfig>,
  'applyYawDelta' | 'config' | 'eventTarget' | 'interactive'
>

/**
 * 単発スピン action の購読・可視化
 *
 * - `ACTION_SPIN`(クリック起点・外部 dispatch いずれも同じ)を購読し `spinRef` を起動
 * - 加速(`accelSec`)→ 最大速度維持(`holdSec`)→ 減速(`decelSec`)→ 停止 の 1 サイクル。\
 *   各フェーズ長・最大速度は `host.config`(`SPIN_DEFAULTS` ← `actionConfig.spin` 上書き)を既定に、\
 *   dispatch 時の `CustomEvent.detail`(`SpinOverride`)で 1 回だけ上書きできる
 * - yaw の適用は `host.applyYawDelta`(adapter が回転グループの `rotation.y` へ増分加算)。\
 *   THREE を直接触らない
 * - `spinRef` / `spinConfigRef` は本アクションがローカルに持つ
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useSpin = (host: SpinHost): void => {
  const { applyYawDelta, config, eventTarget, interactive } = host

  /** スピン進行度。-1: 非スピン中、0以上: 経過秒数 */
  const spinRef = useRef(-1)
  /** 実行中スピンの解決済みパラメータ。null のときは `config` を使う */
  const spinConfigRef = useRef<null | SpinConfig>(null)

  const onSpin = (e: Event) => {
    if (!interactive) return
    if (spinRef.current >= 0) return

    const override = (e as CustomEvent<SpinOverride | undefined>).detail
    spinConfigRef.current = { ...config, ...override }
    spinRef.current = 0
  }

  useEventListener(ACTION_SPIN, onSpin, { target: eventTarget })

  // 進行度に応じた角速度を求め、このフレーム分の回転量を適用
  useFrame((_, dt) => {
    if (spinRef.current < 0) return

    const { accelSec, decelSec, holdSec, maxSpeed } =
      spinConfigRef.current ?? config
    const total = accelSec + holdSec + decelSec

    spinRef.current += dt
    if (spinRef.current >= total) {
      spinRef.current = -1
      spinConfigRef.current = null
      return
    }

    const t = spinRef.current
    let speed: number
    if (t < accelSec) speed = maxSpeed * (t / accelSec)
    else if (t < accelSec + holdSec) speed = maxSpeed
    else speed = maxSpeed * (1 - (t - accelSec - holdSec) / decelSec)

    applyYawDelta(speed * dt)
  })
}

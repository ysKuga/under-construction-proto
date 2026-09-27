import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import { ACTION_FACE, type FaceOverride } from './config'

/** face が host から必要とする操作面 */
type FaceHost = Pick<
  BoxBotActionContext<never>,
  'applyYawDelta' | 'eventTarget' | 'interactive' | 'readFacing'
>

/** 時間をかけた向き変更の進行状態 */
type FaceTween = {
  /** 適用済みの回転量(rad) */
  applied: number
  /** 回転させる総量(rad、開始時の向きからの最短差分) */
  delta: number
  /** 所要時間(ms) */
  durationMs: number
  /** 経過時間(ms) */
  elapsedMs: number
}

/** rad を -π 〜 π の最短差分へ正規化する */
const normalizeDelta = (delta: number): number => {
  const twoPi = Math.PI * 2

  return ((((delta + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI
}

/** 進行度カーブ(ease-in-out。0→1 で加速してから減速して到達) */
const ease = (p: number): number =>
  p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2

/**
 * 向き変更 action の購読
 *
 * - `ACTION_FACE`(外部 dispatch のみ、クリック起点なし)を購読し、指定角度(`FaceOverride.rad`、\
 *   絶対値)へ切り替える
 * - `FaceOverride.durationMs` 指定時は `useFrame` で ease-in-out 補間して回す。省略時・0 以下は\
 *   受信時に 1 回だけ適用する(瞬時)
 * - 回転中に次の face を受けた場合、その時点の向きから新しい指定角度へ向け直す
 * - 適用は `host.readFacing()`(現在の実効向き)との差分を `host.applyYawDelta` へ渡す形。\
 *   `applyYawDelta` は増分加算専用のため、絶対角度セット用の adapter API は追加しない
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useFace = (host: FaceHost): void => {
  const { applyYawDelta, eventTarget, interactive, readFacing } = host

  /** 時間をかけた向き変更の進行状態。null: 回転中でない */
  const tweenRef = useRef<FaceTween | null>(null)

  const onFace = (e: Event) => {
    if (!interactive) return

    const detail = (e as CustomEvent<FaceOverride | undefined>).detail

    if (!detail) return

    const delta = normalizeDelta(detail.rad - readFacing())
    const durationMs = detail.durationMs ?? 0

    // 所要時間の指定なし: 瞬時に切り替える(回転中のものは打ち切る)
    if (durationMs <= 0) {
      tweenRef.current = null
      applyYawDelta(delta)

      return
    }

    tweenRef.current = { applied: 0, delta, durationMs, elapsedMs: 0 }
  }

  useEventListener(ACTION_FACE, onFace, { target: eventTarget })

  // 回転中: 進行度に応じた回転量との差分をこのフレーム分として適用する
  useFrame((_, dt) => {
    const tween = tweenRef.current

    if (!tween) return

    tween.elapsedMs += dt * 1000

    const progress = Math.min(tween.elapsedMs / tween.durationMs, 1)
    const target = tween.delta * ease(progress)

    applyYawDelta(target - tween.applied)
    tween.applied = target

    if (progress >= 1) tweenRef.current = null
  })
}

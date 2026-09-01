import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import type { BoxBotActionContext } from '../types'

import { type BodyBobbingConfig } from './config'

/** これ以下なら脚 swing が動いていないとみなす (rad) */
const SWING_EPS = 1e-3
/** これ以下なら脚 bob が動いていないとみなす (world) */
const BOB_EPS = 1e-4
/** 体の高さがこれ以下なら「戻しきった」とみなす (world) */
const SETTLED_EPS = 1e-5

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

/** body-bobbing が host から必要とする操作面 */
type BodyBobbingHost = Pick<
  BoxBotActionContext<BodyBobbingConfig>,
  'applyBodyBob' | 'config' | 'readLegBob' | 'readLegSwing'
>

/**
 * walking / marching 中に体全体を上下させる可視化
 *
 * - dispatch で on/off しない。登録されていれば walking (脚 swing) / marching (脚 bob) に\
 *   常時連動し、どちらも動いていなければ体の高さを 0 に戻す。無効化は `actions` 配列から外す
 * - 脚の現在値は `host.readLegSwing` / `host.readLegBob` で読む (walking / marching が書いた値)。\
 *   進行度は持たず、脚の状態が唯一の入力。反映は `host.applyBodyBob`(adapter が `walkingBobRef` の\
 *   `position.y` へ)
 * - marching 連動を優先。marching の脚 bob があれば「最も踏み込んだ脚」の沈み量を体の持ち上げに、\
 *   なければ walking の「支持脚が垂直に近いほど体が高い」で算出する (samples と同じ考え方)
 * - `height` は最大持ち上げ量、`swingRef` / `bobRef` は walking / marching の振幅の基準\
 *   (正規化の分母)。walking / marching の config 振幅を変えたら合わせる
 * - 直前に 0 を書いており脚も動いていなければ `useFrame` を早期 return する
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useBodyBobbing = (host: BodyBobbingHost): void => {
  const { applyBodyBob, config, readLegBob, readLegSwing } = host

  /** 直前フレームで書いた体の高さ (world) */
  const lastYRef = useRef(0)

  useFrame(() => {
    const bob = readLegBob()
    const swing = readLegSwing()

    const marching =
      Math.abs(bob.left) > BOB_EPS || Math.abs(bob.right) > BOB_EPS
    const walking =
      Math.abs(swing.left) > SWING_EPS || Math.abs(swing.right) > SWING_EPS

    if (!marching && !walking) {
      if (lastYRef.current < SETTLED_EPS) return
      lastYRef.current = 0
      applyBodyBob(0)
      return
    }

    const { bobRef, height, swingRef } = config

    let y: number
    if (marching) {
      // 最も下がった (踏み込んだ) 脚の沈み量を体の持ち上げへ
      const lift = -Math.min(bob.left, bob.right)
      y = clamp01(lift / bobRef) * height
    } else {
      // 支持脚 (rotation.x が 0 に近い = 垂直) ほど体が高い
      const minSupport = Math.cos(swingRef)
      const denom = 1 - minSupport
      const support = Math.max(Math.cos(swing.left), Math.cos(swing.right))
      y = denom > 1e-6 ? clamp01((support - minSupport) / denom) * height : 0
    }

    lastYRef.current = y
    applyBodyBob(y)
  })
}

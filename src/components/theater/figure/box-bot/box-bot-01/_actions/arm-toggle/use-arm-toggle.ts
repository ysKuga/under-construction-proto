import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import { approach } from '../../_lib/approach'
import type { BoxBotActionContext } from '../types'

import {
  ACTION_ARM_TOGGLE,
  type ArmToggleConfig,
  type ArmToggleOverride,
} from './config'

/** これ以下なら「下げきった」とみなす角度 (rad) */
const SETTLED_EPS = 1e-3

/** arm-toggle が host から必要とする操作面 */
type ArmToggleHost = Pick<
  BoxBotActionContext<ArmToggleConfig>,
  'applyArmLift' | 'config' | 'eventTarget' | 'interactive'
>

/**
 * 左右の腕の上げ下げ toggle action の購読・可視化
 *
 * - `ACTION_ARM_TOGGLE`(外部 dispatch)を購読。`detail.side`(既定 `'both'`)で指定された腕の\
 *   up/down 状態をトグルする
 * - 目標角は左 `-upDelta` / 右 `+upDelta`(下げ時は 0)。`approach` で毎フレーム補間し、\
 *   `host.applyArmLift`(adapter が左右の腕グループの `rotation.z` へ)で反映する。\
 *   現在角(`leftZRef` / `rightZRef`)はこの action がローカルに持ち、補間を所有する\
 *   (host は書くだけ)
 * - fall の腕引き寄せ(`rotation.x`)とは軸が別なので、同時に適用されても破綻しない
 * - 上げ下げ状態(`*UpRef`)は `useState` でなく `useRef`。JSX 再レンダーに関与しないため\
 *   (r3f-state ルール)。両腕が下げきっている間は `useFrame` を早期 return する
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useArmToggle = (host: ArmToggleHost): void => {
  const { applyArmLift, config, eventTarget, interactive } = host

  /** 左腕が上がっているか */
  const leftUpRef = useRef(false)
  /** 右腕が上がっているか */
  const rightUpRef = useRef(false)
  /** 左腕の現在の持ち上げ角 (rad) */
  const leftZRef = useRef(0)
  /** 右腕の現在の持ち上げ角 (rad) */
  const rightZRef = useRef(0)

  const onArmToggle = (e: Event) => {
    if (!interactive) return

    const side =
      (e as CustomEvent<ArmToggleOverride | undefined>).detail?.side ?? 'both'
    if (side === 'left' || side === 'both')
      leftUpRef.current = !leftUpRef.current
    if (side === 'right' || side === 'both')
      rightUpRef.current = !rightUpRef.current
  }

  useEventListener(ACTION_ARM_TOGGLE, onArmToggle, { target: eventTarget })

  useFrame((_, dt) => {
    // 両腕が下げきって静止しているなら書かない
    if (
      !leftUpRef.current &&
      !rightUpRef.current &&
      Math.abs(leftZRef.current) < SETTLED_EPS &&
      Math.abs(rightZRef.current) < SETTLED_EPS
    )
      return

    const { approachRate, upDelta } = config
    const leftTarget = leftUpRef.current ? -upDelta : 0
    const rightTarget = rightUpRef.current ? upDelta : 0

    leftZRef.current = approach(leftZRef.current, leftTarget, approachRate, dt)
    rightZRef.current = approach(
      rightZRef.current,
      rightTarget,
      approachRate,
      dt,
    )

    applyArmLift({ left: leftZRef.current, right: rightZRef.current })
  })
}

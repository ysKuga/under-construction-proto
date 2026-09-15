import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import { approach } from '../../_lib/approach'
import type { BoxBotActionContext } from '../types'

import { ACTION_WALKING, type WalkingConfig } from './config'

/** 角速度がこれを下回ったら停止とみなし、脚角を直接 0 へ戻す (rad/s) */
const STOP_SPEED_EPS = 0.05
/** これ以下なら「戻しきった」とみなす角度 (rad) */
const SETTLED_EPS = 1e-3

/** walking が host から必要とする操作面 */
type WalkingHost = Pick<
  BoxBotActionContext<WalkingConfig>,
  | 'applyArmSwing'
  | 'applyLegSwing'
  | 'config'
  | 'eventTarget'
  | 'interactive'
  | 'readPosture'
>

/**
 * 歩行(脚の前後スイング)toggle action の購読・可視化
 *
 * - `ACTION_WALKING`(外部 dispatch)を購読し、1 回の dispatch で on/off をトグルする。\
 *   `readPosture() !== 0`(転倒中/横倒し/起き上がり中)の間はトグルを無視する
 * - `activeRef` の on/off で角速度の目標値を切替え、`approach` で滑らかに寄せる\
 *   (開始で加速、停止で減速)。角速度が `STOP_SPEED_EPS` を下回ったら位相追従をやめ、\
 *   脚角を直接 0 へ `approach` する(sin 波の途中で止めると脚が斜めのまま静止するため)
 * - 位相・角速度・左右の現在角(`phaseRef` / `speedRef` / `*AngleRef`)は本 action が\
 *   ローカルに持つ。脚グループへの反映は `host.applyLegSwing`(adapter が `leg.leftRef` /\
 *   `leg.rightRef` の `rotation.x` へ)。両脚が戻りきって静止中は `useFrame` を早期 return する
 * - 腕も脚と同じ位相・速度で振る(`host.applyArmSwing`)。反対側の脚が前へ出るとき腕も\
 *   前へ出る(左腕は右脚と同位相 = 逆の sin 波)自然な歩行の対応にする。振幅は\
 *   `config.armSwingAngle` で脚と別に持つ
 * - marching(`position.y`)とは軸が別なので、同時に適用されても破綻しない
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useWalking = (host: WalkingHost): void => {
  const {
    applyArmSwing,
    applyLegSwing,
    config,
    eventTarget,
    interactive,
    readPosture,
  } = host

  /** 歩行中か */
  const activeRef = useRef(false)
  /** 脚 swing の位相 (rad) */
  const phaseRef = useRef(0)
  /** 現在の角速度 (rad/s) */
  const speedRef = useRef(0)
  /** 左脚の現在のスイング角 (rad) */
  const leftAngleRef = useRef(0)
  /** 右脚の現在のスイング角 (rad) */
  const rightAngleRef = useRef(0)
  /** 左腕の現在の振り角 (rad) */
  const leftArmAngleRef = useRef(0)
  /** 右腕の現在の振り角 (rad) */
  const rightArmAngleRef = useRef(0)

  const onWalking = () => {
    if (!interactive) return
    if (readPosture() !== 0) return
    activeRef.current = !activeRef.current
  }

  useEventListener(ACTION_WALKING, onWalking, { target: eventTarget })

  useFrame((_, dt) => {
    // 停止していて両脚・両腕も戻りきっているなら書かない
    if (
      !activeRef.current &&
      speedRef.current <= STOP_SPEED_EPS &&
      Math.abs(leftAngleRef.current) < SETTLED_EPS &&
      Math.abs(rightAngleRef.current) < SETTLED_EPS &&
      Math.abs(leftArmAngleRef.current) < SETTLED_EPS &&
      Math.abs(rightArmAngleRef.current) < SETTLED_EPS
    )
      return

    const {
      armSwingAngle,
      cycleSec,
      settleRate,
      speedApproachRate,
      swingAngle,
    } = config
    const targetSpeed = activeRef.current ? (2 * Math.PI) / cycleSec : 0
    speedRef.current = approach(
      speedRef.current,
      targetSpeed,
      speedApproachRate,
      dt,
    )

    if (activeRef.current || speedRef.current > STOP_SPEED_EPS) {
      phaseRef.current += speedRef.current * dt
      leftAngleRef.current = Math.sin(phaseRef.current) * swingAngle
      rightAngleRef.current = Math.sin(phaseRef.current + Math.PI) * swingAngle
      // 腕は反対側の脚と同位相(左腕 = 右脚、右腕 = 左脚)
      leftArmAngleRef.current =
        Math.sin(phaseRef.current + Math.PI) * armSwingAngle
      rightArmAngleRef.current = Math.sin(phaseRef.current) * armSwingAngle
    } else {
      // sin 途中で止まらないよう、位相をリセットして角度を直接 0 へ寄せる
      phaseRef.current = 0
      leftAngleRef.current = approach(leftAngleRef.current, 0, settleRate, dt)
      rightAngleRef.current = approach(rightAngleRef.current, 0, settleRate, dt)
      leftArmAngleRef.current = approach(
        leftArmAngleRef.current,
        0,
        settleRate,
        dt,
      )
      rightArmAngleRef.current = approach(
        rightArmAngleRef.current,
        0,
        settleRate,
        dt,
      )
    }

    applyLegSwing({ left: leftAngleRef.current, right: rightAngleRef.current })
    applyArmSwing({
      left: leftArmAngleRef.current,
      right: rightArmAngleRef.current,
    })
  })
}

import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import {
  ACTION_FALL,
  FALL_ANGLE,
  FALL_ARM_ANGLE,
  FALL_DUR,
  GET_UP_DUR,
} from './config'

/** fall が host から必要とする操作面 */
type FallHost = Pick<
  BoxBotActionContext,
  'applyArmAngle' | 'applyTiltAngle' | 'eventTarget' | 'interactive'
>

/**
 * 転倒 → 横倒しで静止 → 起き上がり を 1 アクションで扱う
 *
 * - `phaseRef`: 0 直立 / 1 転倒中 / 2 横倒しで静止 / 3 起き上がり中
 * - `ACTION_FALL`(クリック起点・外部 dispatch 共通)を購読。直立中なら転倒、\
 *   横倒し中なら起き上がりを起動する(アニメ中は無視)。get-up は転倒の逆補間
 * - 前傾は `host.applyTiltAngle`(adapter が接地点 pivot グループの `rotation.x` へ)、\
 *   腕は `host.applyArmAngle`(adapter が左右の腕グループの `rotation.x` へ)。THREE を直接触らない
 * - 転倒開始時は腕を即座に `FALL_ARM_ANGLE` へ切替え、起き上がりでのみ 0 へ補間して戻す
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useFall = (host: FallHost): void => {
  const { applyArmAngle, applyTiltAngle, eventTarget, interactive } = host

  /** 姿勢フェーズ。0 直立 / 1 転倒中 / 2 横倒しで静止 / 3 起き上がり中 */
  const phaseRef = useRef(0)
  /** 現フェーズの経過秒。-1: アニメーションしていない */
  const tRef = useRef(-1)

  const onFall = () => {
    if (!interactive) return

    if (phaseRef.current === 0) {
      phaseRef.current = 1
      tRef.current = 0
      applyArmAngle(FALL_ARM_ANGLE)
    } else if (phaseRef.current === 2) {
      phaseRef.current = 3
      tRef.current = 0
    }
  }

  useEventListener(ACTION_FALL, onFall, { target: eventTarget })

  // 転倒 / 起き上がりの進行度に応じて前傾角・腕角を毎フレーム適用
  useFrame((_, dt) => {
    if (tRef.current < 0) return

    if (phaseRef.current === 1) {
      tRef.current += dt
      if (tRef.current >= FALL_DUR) {
        phaseRef.current = 2
        tRef.current = -1
        applyTiltAngle(FALL_ANGLE)
        return
      }
      const p = tRef.current / FALL_DUR
      applyTiltAngle(FALL_ANGLE * (p * (2 - p)))
      return
    }

    if (phaseRef.current === 3) {
      tRef.current += dt
      if (tRef.current >= GET_UP_DUR) {
        phaseRef.current = 0
        tRef.current = -1
        applyTiltAngle(0)
        applyArmAngle(0)
        return
      }
      const p = tRef.current / GET_UP_DUR
      applyTiltAngle(FALL_ANGLE * (1 - p * p))
      applyArmAngle(FALL_ARM_ANGLE * (1 - p * p))
    }
  })
}

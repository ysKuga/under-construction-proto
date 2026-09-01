import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import { approach } from '../../_lib/approach'
import type { BoxBotActionContext } from '../types'

import { ACTION_MARCHING, type MarchingConfig } from './config'

/** これ以下なら「戻しきった」とみなすオフセット (world) */
const SETTLED_EPS = 1e-4

/** marching が host から必要とする操作面 */
type MarchingHost = Pick<
  BoxBotActionContext<MarchingConfig>,
  'applyLegBob' | 'config' | 'eventTarget' | 'interactive' | 'readPosture'
>

/**
 * 足踏み(脚の上下 bob)toggle action の購読・可視化
 *
 * - `ACTION_MARCHING`(外部 dispatch)を購読し、1 回の dispatch で on/off をトグルする。\
 *   `readPosture() !== 0`(転倒中/横倒し/起き上がり中)の間はトグルを無視する
 * - 足踏み中は位相を進めて左右の脚を逆位相で上下させる。停止すると位相をリセットし、\
 *   左右のオフセットを `approach` で 0 へ戻す
 * - 位相・左右の現在オフセット(`phaseRef` / `*OffsetRef`)は本 action がローカルに持つ。\
 *   脚グループへの反映は `host.applyLegBob`(adapter が付け根 base からの `position.y` へ)。\
 *   停止していて両脚が戻りきっていれば `useFrame` を早期 return する
 * - walking(`rotation.x`)とは軸が別なので、同時に適用されても破綻しない
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useMarching = (host: MarchingHost): void => {
  const { applyLegBob, config, eventTarget, interactive, readPosture } = host

  /** 足踏み中か */
  const activeRef = useRef(false)
  /** 脚 bob の位相 (rad) */
  const phaseRef = useRef(0)
  /** 左脚の現在の上下オフセット (world) */
  const leftOffsetRef = useRef(0)
  /** 右脚の現在の上下オフセット (world) */
  const rightOffsetRef = useRef(0)

  const onMarching = () => {
    if (!interactive) return
    if (readPosture() !== 0) return
    activeRef.current = !activeRef.current
  }

  useEventListener(ACTION_MARCHING, onMarching, { target: eventTarget })

  useFrame((_, dt) => {
    // 停止していて両脚も戻りきっているなら書かない
    if (
      !activeRef.current &&
      Math.abs(leftOffsetRef.current) < SETTLED_EPS &&
      Math.abs(rightOffsetRef.current) < SETTLED_EPS
    )
      return

    const { bobHeight, cycleSec, settleRate } = config

    if (activeRef.current) {
      phaseRef.current += dt * ((2 * Math.PI) / cycleSec)
      leftOffsetRef.current = Math.sin(phaseRef.current) * bobHeight
      rightOffsetRef.current = Math.sin(phaseRef.current + Math.PI) * bobHeight
    } else {
      phaseRef.current = 0
      leftOffsetRef.current = approach(leftOffsetRef.current, 0, settleRate, dt)
      rightOffsetRef.current = approach(
        rightOffsetRef.current,
        0,
        settleRate,
        dt,
      )
    }

    applyLegBob({ left: leftOffsetRef.current, right: rightOffsetRef.current })
  })
}

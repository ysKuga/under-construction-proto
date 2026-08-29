import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import {
  ACTION_JUMP,
  JUMP_SQUASH_X,
  JUMP_SQUASH_Y,
  type JumpConfig,
  type JumpOverride,
} from './config'

/** jump が host から必要とする操作面 */
type JumpHost = Pick<
  BoxBotActionContext<JumpConfig>,
  'applyLift' | 'applySquash' | 'config' | 'eventTarget' | 'interactive'
>

/**
 * ジャンプ action の購読・可視化
 *
 * - `ACTION_JUMP`(クリック起点・外部 dispatch・hopping いずれも同じ)を購読し `jumpRef` を起動
 * - 持ち上げ量・継続時間は `host.config`(`JUMP_DEFAULTS` ← `actionConfig.jump` 上書き)を既定に、\
 *   dispatch 時の `CustomEvent.detail`(`JumpOverride`)で 1 回だけ上書きできる。\
 *   開始時に解決して `jumpConfigRef` に固定し、`useFrame` はそれを読む
 * - 縦移動は `host.applyLift`(adapter が表示領域 DOM の `top` を書き換える)、\
 *   潰しは `host.applySquash`(adapter が全体グループの scale へ)。THREE / DOM を直接触らない
 * - `jumpRef` / `jumpConfigRef` は本アクションがローカルに持つ
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useJump = (host: JumpHost): void => {
  const { applyLift, applySquash, config, eventTarget, interactive } = host

  /** ジャンプ進行度。-1: 非ジャンプ中、0以上: 経過秒数 */
  const jumpRef = useRef(-1)
  /** 実行中ジャンプの解決済みパラメータ。null のときは `config` を使う */
  const jumpConfigRef = useRef<JumpConfig | null>(null)

  const onJump = (e: Event) => {
    if (!interactive) return
    if (jumpRef.current >= 0) return

    const override = (e as CustomEvent<JumpOverride | undefined>).detail
    jumpConfigRef.current = {
      durSec: override?.durSec ?? config.durSec,
      liftPx: override?.liftPx ?? config.liftPx,
    }
    jumpRef.current = 0
  }

  useEventListener(ACTION_JUMP, onJump, { target: eventTarget })

  // 進行度に応じた squash と表示領域の持ち上げを毎フレーム適用
  useFrame((_, dt) => {
    // hopping 起点のジャンプは jumpConfigRef を立てないため config に fallback
    const { durSec, liftPx } = jumpConfigRef.current ?? config

    let lift = 0,
      sx = 1,
      sy = 1
    if (jumpRef.current >= 0) {
      jumpRef.current += dt
      if (jumpRef.current >= durSec) {
        jumpRef.current = -1
        jumpConfigRef.current = null
      } else {
        const p = jumpRef.current / durSec
        lift = Math.sin(p * Math.PI) * liftPx
        sy = 1 + JUMP_SQUASH_Y * Math.sin(p * Math.PI * 2)
        sx = 1 - JUMP_SQUASH_X * Math.sin(p * Math.PI * 2)
      }
    }
    applySquash(sx, sy)
    applyLift(lift)
  })
}

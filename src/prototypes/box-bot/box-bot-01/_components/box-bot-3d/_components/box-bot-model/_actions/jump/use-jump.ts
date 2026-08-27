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

/**
 * ジャンプ action の購読・可視化
 *
 * - `ACTION_JUMP`(クリック起点・外部 dispatch・hopping いずれも同じ)を購読し `jumpRef` を起動
 * - 持ち上げ量・継続時間は `cfg.jump` を既定に、dispatch 時の `CustomEvent.detail`(`JumpOverride`)で\
 *   1 回だけ上書きできる。開始時に解決して `jumpConfigRef` に固定し、`useFrame` はそれを読む
 * - 縦移動は表示領域(`displayAreaRef` = Canvas ラッパー DOM)の `top` 書き換えで行い、\
 *   Canvas 内では squash(`rootRef` の scale)のみ制御する。ラッパーへの `transform` 変更は\
 *   r3f Canvas の描画レイヤーが再合成されず画面が動かないため `top` を使う(#108)
 * - `jumpRef` / `jumpConfigRef` は本アクションがローカルに持つ(bot 本体の ref 群から独立)
 *
 * @param ctx アクション実行コンテキスト
 */
export const useJump = (ctx: BoxBotActionContext): void => {
  const { cfg, displayAreaRef, eventTarget, props, refs } = ctx
  const { interactive } = props
  const { rootRef } = refs

  /** ジャンプ進行度。-1: 非ジャンプ中、0以上: 経過秒数 */
  const jumpRef = useRef(-1)
  /** 実行中ジャンプの解決済みパラメータ。null のときは `cfg.jump` を使う */
  const jumpConfigRef = useRef<JumpConfig | null>(null)

  const onJump = (e: Event) => {
    if (!interactive) return
    if (jumpRef.current >= 0) return

    const override = (e as CustomEvent<JumpOverride | undefined>).detail
    jumpConfigRef.current = {
      durSec: override?.durSec ?? cfg.jump.durSec,
      liftPx: override?.liftPx ?? cfg.jump.liftPx,
    }
    jumpRef.current = 0
  }

  useEventListener(ACTION_JUMP, onJump, { target: eventTarget })

  // 進行度に応じた squash(rootRef の scale)と表示領域の持ち上げ(displayAreaRef の top)更新
  useFrame((_, dt) => {
    if (!rootRef.current) return

    // hopping 起点のジャンプは jumpConfigRef を立てないため cfg.jump に fallback
    const { durSec, liftPx } = jumpConfigRef.current ?? cfg.jump

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
    rootRef.current.scale.set(sx, sy, sx)
    // 基準位置 top:50%(JSX 側)からジャンプ分だけ上へずらす。transform は中央寄せ専用に固定
    if (displayAreaRef?.current) {
      displayAreaRef.current.style.top = `calc(50% - ${lift}px)`
    }
  })
}

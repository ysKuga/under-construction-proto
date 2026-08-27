import { useFrame } from '@react-three/fiber'

import { useEventListener } from '@/hooks/event'

import { ACTION_JUMP, JUMP_SQUASH_X, JUMP_SQUASH_Y } from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  JumpOverride,
} from '../index.types'

/**
 * ジャンプ action の購読・可視化
 *
 * - `BoxBot-action-jump` イベントの受信(`jumpRef` の起動)を `useEventListener` で行う。\
 *   クリック起点(`clickBody`/`clickHead`、`useClickActions`)・外部起点\
 *   (`useBoxBotActionDispatcher`)いずれも同じイベントを dispatch するため、実行判定が一本化される
 * - 持ち上げ量・継続時間は `cfg.jump`(props の `jump` ?? `DEFAULTS.jump`)を既定にしつつ、\
 *   dispatch 時の `CustomEvent.detail`(`JumpOverride`)で 1 回だけ上書きできる。\
 *   開始時に解決して `jumpConfigRef` に固定し、`useFrame` はそれを読む
 * - `interactive` による制御も実行側(`jumpAction`)で行う
 * - 縦移動は表示領域(`jumpLiftRef` = Canvas ラッパー DOM)の `top` オフセット書き換えで行い、\
 *   Canvas 内では squash(`rootRef` の scale)のみ制御する(#108)。\
 *   ラッパーへの `transform` 変更は r3f Canvas の描画レイヤーが再合成されず画面が動かないため\
 *   `top` を使う。`jumpRef`/`rootRef` 自体は `BoxBotRefsProvider` が生成し `useBoxBotRefs` 経由で取得する
 *
 * @param props BoxBotModel に渡される props
 * @param cfg マージ済みの設定値(`jump` の既定値を参照する)
 */
export const useJumpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
  cfg: BoxBot3DConfig,
): void => {
  const { interactive, jumpLiftRef } = props

  const { jumpConfigRef, jumpRef, rootRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const jumpAction = (e: Event) => {
    if (!interactive) return
    if (jumpRef.current >= 0) return

    const override = (e as CustomEvent<JumpOverride | undefined>).detail
    jumpConfigRef.current = {
      durSec: override?.durSec ?? cfg.jump.durSec,
      liftPx: override?.liftPx ?? cfg.jump.liftPx,
    }
    jumpRef.current = 0
  }

  useEventListener(ACTION_JUMP, jumpAction, { target: eventTarget })

  // ジャンプ進行度に応じた squash(rootRef の scale)と表示領域の持ち上げ(jumpLiftRef)更新
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
    // 基準位置 top:50%(JSX 側)からジャンプ分だけ上へずらす。transform は
    // 中央寄せ(translate(-50%,-50%))専用に固定し、こちらは触らない
    if (jumpLiftRef?.current) {
      jumpLiftRef.current.style.top = `calc(50% - ${lift}px)`
    }
  })
}

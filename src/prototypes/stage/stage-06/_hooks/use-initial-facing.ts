import { useEffect, useRef } from 'react'

import { screenAngleToYaw } from '@/components/theater/figure/box-bot'

import {
  GridSize,
  useActorNodeRegistry,
} from '../_contexts/actor-node-registry'
import {
  gridDirectionToScreenAngle,
  pickInitialFacingTarget,
} from '../_lib/direction'
import { PLAYER_ACTOR_ID } from '../constants'

/** face dispatch を打ち切るまでの最大フレーム数(listener attach 待ち) */
const MAX_RETRY_FRAMES = 30

/**
 * 初期表示時、隣接に進入不可(グリッド範囲外)マスがあれば進入可能マスへ向ける
 *
 * - マウント時に box-bot-01 の face action を dispatch する
 * - box-bot-01 の Canvas(r3f の別レンダラ)側で action の listener が attach
 *   されるまで数フレーム(実測で 8〜9 フレーム程度)かかるため、attach 前の
 *   dispatch は失われる。`MAX_RETRY_FRAMES` フレームの間 rAF で再送し続け、
 *   listener attach 後の 1 回を確実に届ける(絶対角度指定の dispatch のため、
 *   attach 済み以降の重複送信は差分 0 の no-op になり無害)
 * - `face` は `useBoxBotActionDispatcher` の戻り値で毎レンダー新しい関数になるが、
 *   ここでは最新値を ref 経由で読むだけにし、effect 自体はマウント時 1 度だけ実行する
 * - `preferredScreenAngle` 省略時は、隣接に進入不可(グリッド範囲外)マスがあれば
 *   進入可能マスへ向ける（範囲外の隣接がなければ既定の向きのまま）
 * - `preferredScreenAngle` 指定時はその画面角度をそのまま使う（進入可否は見ない。
 *   斜め方向等、隣接セルでない向きも指定できる）
 *
 * @param face box-bot-01 の face action dispatcher(省略時は何もしない)
 * @param gridSize グリッドの形状(隣接判定に使う。`preferredScreenAngle` 指定時は未使用)
 * @param preferredScreenAngle 明示的な初期向き(画面角度、rad、atan2 基準:
 *   0 = 右、π/2 = 下。例: 右下 = `Math.PI / 4`)。省略時は隣接判定で自動算出
 */
export const useInitialFacing = (
  face: ((override: { rad: number }) => Promise<void>) | undefined,
  gridSize: GridSize,
  preferredScreenAngle?: number,
): void => {
  const { getActorPosition } = useActorNodeRegistry()
  const faceRef = useRef(face)

  useEffect(() => {
    // 毎レンダー最新の face を ref へ反映する(react-hooks/refs: render 中の書込み禁止)
    faceRef.current = face
  })

  useEffect(() => {
    let screenAngle = preferredScreenAngle

    if (screenAngle === undefined) {
      const current = getActorPosition(PLAYER_ACTOR_ID)
      const target = pickInitialFacingTarget(current, gridSize)

      if (!target) return

      screenAngle = gridDirectionToScreenAngle(current, target)
    }

    const rad = screenAngleToYaw(screenAngle)

    let handle = 0
    let frame = 0
    const tick = () => {
      frame += 1
      void faceRef.current?.({ rad })

      if (frame < MAX_RETRY_FRAMES) {
        handle = requestAnimationFrame(tick)
      }
    }

    handle = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(handle)
    // マウント時 1 度だけ実行する。gridSize は不変、face は faceRef 経由で読む
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

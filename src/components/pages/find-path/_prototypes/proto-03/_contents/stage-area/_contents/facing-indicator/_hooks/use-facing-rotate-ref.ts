import { useEffect, useRef } from 'react'

import {
  ACTION_FACE,
  type FaceOverride,
  yawToScreenAngle,
} from '@/components/theater/figure/box-bot'

import { usePlayerActorEventTarget } from '../../../../../_contexts/player-actor-event-target'

/** rad を deg へ変換する */
const toDeg = (rad: number): number => (rad * 180) / Math.PI

/** deg を -180 〜 180 の最短差分へ正規化する */
const normalizeDeltaDeg = (delta: number): number =>
  ((((delta + 180) % 360) + 360) % 360) - 180

/**
 * ステージ上の bot の向き(face action)に合わせて回転させる要素の ref を返す
 *
 * - player bot と共有する EventTarget の `ACTION_FACE` を購読し、yaw を画面角度\
 *   (0 = 右、時計回り)へ戻して ref 先の `transform: rotate()` へ直書きする。\
 *   state を持たないため再レンダリングは発生しない
 * - 角度は正規化せず累積で持ち、最短差分を加算する。0° をまたぐ向き変更で\
 *   CSS transition が逆回りしないようにするため
 * - `useEventListener` は同一 target・type の多重登録を禁止しており、bot 側の face\
 *   listener と衝突するため `addEventListener` で直接購読する
 */
export const useFacingRotateRef = () => {
  const playerActorEventTarget = usePlayerActorEventTarget()
  const facingRotateRef = useRef<HTMLDivElement>(null)
  /** 現在の回転角(deg、累積)。初期値は bot の既定 yaw(0)の画面角度 */
  const rotateDegRef = useRef(toDeg(yawToScreenAngle(0)))

  useEffect(() => {
    // 初期角度を反映し、face action の受信ごとに回転角を更新する
    const applyRotate = () => {
      if (!facingRotateRef.current) return

      facingRotateRef.current.style.transform = `rotate(${rotateDegRef.current}deg)`
    }
    const onFace = (event: Event) => {
      const detail = (event as CustomEvent<FaceOverride | undefined>).detail

      if (!detail) return

      const targetDeg = toDeg(yawToScreenAngle(detail.rad))

      rotateDegRef.current += normalizeDeltaDeg(
        targetDeg - rotateDegRef.current,
      )
      applyRotate()
    }

    applyRotate()
    playerActorEventTarget.addEventListener(ACTION_FACE, onFace)

    return () => {
      playerActorEventTarget.removeEventListener(ACTION_FACE, onFace)
    }
  }, [playerActorEventTarget])

  return facingRotateRef
}

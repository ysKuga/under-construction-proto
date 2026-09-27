import { useEffect, useRef } from 'react'

import {
  ACTION_FACE,
  type FaceOverride,
} from '@/components/theater/figure/box-bot'

/** 同期解除時に戻す向き(rad)。bot の既定 yaw(カメラ正面) */
const DEFAULT_FACING_RAD = 0

/**
 * `source` の向き(face action)を、有効時のみ `target` へ同期する
 *
 * - 独立 bot の向きをステージ上の bot と同期するオプション用(issue #137)
 * - 無効中も `source` の最新の向きを記録し、有効化した時点でその向きへ合わせる
 * - 無効化した時点で、既定の向き(`DEFAULT_FACING_RAD`)へ戻す
 * - `useEventListener` は同一 target・type の多重登録を禁止しており、bot 側の face\
 *   listener と衝突するため `addEventListener` で直接購読する
 *
 * @param source 購読元(ステージ上の bot の EventTarget)
 * @param target 同期先(独立 bot の EventTarget)
 * @param enabled 向きを同期するか
 */
export const useRelayFacing = (
  source: EventTarget,
  target: EventTarget,
  enabled: boolean,
) => {
  /** `source` へ最後に dispatch された向き(rad) */
  const lastRadRef = useRef(DEFAULT_FACING_RAD)

  useEffect(() => {
    // 切替時点の向きを target へ反映し、以後 source の face を記録・(有効時のみ)再送する
    const face = (rad: number) => {
      target.dispatchEvent(
        new CustomEvent<FaceOverride>(ACTION_FACE, { detail: { rad } }),
      )
    }
    const onFace = (event: Event) => {
      const detail = (event as CustomEvent<FaceOverride | undefined>).detail

      if (!detail) return

      lastRadRef.current = detail.rad

      if (enabled) face(detail.rad)
    }

    face(enabled ? lastRadRef.current : DEFAULT_FACING_RAD)
    source.addEventListener(ACTION_FACE, onFace)

    return () => {
      source.removeEventListener(ACTION_FACE, onFace)
    }
  }, [enabled, source, target])
}

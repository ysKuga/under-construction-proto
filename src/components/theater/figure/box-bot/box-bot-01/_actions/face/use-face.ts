import { useEventListener } from '@/hooks/event'

import type { BoxBotActionContext } from '../types'

import { ACTION_FACE, type FaceOverride } from './config'

/** face が host から必要とする操作面 */
type FaceHost = Pick<
  BoxBotActionContext<never>,
  'applyYawDelta' | 'eventTarget' | 'interactive' | 'readFacing'
>

/** rad を -π 〜 π の最短差分へ正規化する */
const normalizeDelta = (delta: number): number => {
  const twoPi = Math.PI * 2

  return ((((delta + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI
}

/**
 * 向き変更 action の購読
 *
 * - `ACTION_FACE`(外部 dispatch のみ、クリック起点なし)を購読し、指定角度(`FaceOverride.rad`、\
 *   絶対値)へ瞬時に切り替える。`useFrame` は使わず、イベント受信時に 1 回だけ適用する
 * - 適用は `host.readFacing()`(現在の実効向き)との差分を `host.applyYawDelta` へ渡す形。\
 *   `applyYawDelta` は増分加算専用のため、絶対角度セット用の adapter API は追加しない
 *
 * @param host アクション実行に必要な操作面(adapter が実装)
 */
export const useFace = (host: FaceHost): void => {
  const { applyYawDelta, eventTarget, interactive, readFacing } = host

  const onFace = (e: Event) => {
    if (!interactive) return

    const detail = (e as CustomEvent<FaceOverride | undefined>).detail

    if (!detail) return

    applyYawDelta(normalizeDelta(detail.rad - readFacing()))
  }

  useEventListener(ACTION_FACE, onFace, { target: eventTarget })
}

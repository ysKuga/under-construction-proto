import { useEventListener } from '@/hooks/event'

import { ACTION_MARCHING_TOGGLE } from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * 足踏みしている状態(marching)の toggle action の発火・購読
 *
 * - 見た目の挙動(脚の上下等)は持たない。`marchingRef` のみ公開する
 * - walking と同じく JSX の再レンダリングに関与しない値のため ref で保持する。ref 自体は\
 *   `BoxBotRefsProvider` が生成し `useBoxBotRefs` 経由で取得する
 * - jump/arm/walking と同じく `useEventListener` 側で実行判定(`interactive` チェック・\
 *   state 切替)を行う。現状クリック起点の発火経路はなく、`useBoxBotActionDispatcher` 経由の\
 *   外部発火のみを受け付ける
 * - 姿勢(`postureRef`)が直立(0)でない間は toggle 自体を無視する(倒れている間は足踏み開始不可)
 *
 * @param props BoxBotModel に渡される props
 */
export const useMarchingAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'marchingRef'> => {
  const { interactive = true } = props

  const { marchingRef, postureRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const toggleAction = () => {
    if (!interactive) return
    if (postureRef.current !== 0) return
    marchingRef.current = !marchingRef.current
  }

  useEventListener(ACTION_MARCHING_TOGGLE, toggleAction, {
    target: eventTarget,
  })

  return { marchingRef }
}

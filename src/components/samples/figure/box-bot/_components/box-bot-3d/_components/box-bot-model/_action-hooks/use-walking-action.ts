import { useEventListener } from '@/hooks/event'

import { ACTION_WALKING_TOGGLE } from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * 歩いている状態(walking)の toggle action の発火・購読
 *
 * - 見た目の挙動(脚の上下・前後スイング・bobbing 等)は持たない。`walkingRef` のみ公開する
 * - jump と同じく JSX の再レンダリングに関与しない値のため ref で保持する。`useFrame` 側で\
 *   `.current` を直接読み書きする想定(挙動実装は次段階)。ref 自体は `BoxBotRefsProvider` が\
 *   生成し `useBoxBotRefs` 経由で取得する(次段階で複数の挙動 hook から参照される想定のため)
 * - jump/arm と同じく `useEventListener` 側で実行判定(`interactive` チェック・state 切替)を行う。\
 *   現状クリック起点の発火経路はなく、`useBoxBotActionDispatcher` 経由の外部発火のみを受け付ける
 * - 姿勢(`postureRef`)が直立(0)でない間は toggle 自体を無視する(倒れている間は歩行開始不可)
 *
 * @param props BoxBotModel に渡される props
 */
export const useWalkingAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'walkingRef'> => {
  const { interactive = true } = props

  const { postureRef, walkingRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const toggleAction = () => {
    if (!interactive) return
    if (postureRef.current !== 0) return
    walkingRef.current = !walkingRef.current
  }

  useEventListener(ACTION_WALKING_TOGGLE, toggleAction, {
    target: eventTarget,
  })

  return { walkingRef }
}

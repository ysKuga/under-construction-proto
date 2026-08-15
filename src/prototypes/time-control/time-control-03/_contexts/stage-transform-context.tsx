import { PropsWithChildren, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { createRequiredContext } from '@/utils/create-required-context'

import { computeFitTransform, StageTransform } from '../_lib/stage-coords'
import { usePlannedPathStore } from '../_stores/planned-path'
import { useTimeControl03Props } from '../index.contexts'

const { Context: StageTransformContext, useContextValue: useStageTransform } =
  createRequiredContext<StageTransform>(
    'useStageTransform should be used within <StageTransformProvider>',
  )

export {
  /** 現在の stage transform を取得する */
  useStageTransform,
}

type StageTransformProviderProps = PropsWithChildren

/**
 * 全 actor の目標地点 (予定経路の終点) から算出した stage transform を配布する
 *
 * - 全 actor の目標地点の bounding box が表示領域に収まるよう scale・中心を算出する
 * - `plannedPathById` は `set target` (企図) 時のみ更新され行動決定では変化しないため、\
 *   これを基準にすることで行動決定中の逐次位置更新では再計算されない\
 *   (`positionStore` を購読すると tick 毎に全 actor が再レンダリングされ続けるため避ける)
 * - 未企図 actor (予定経路が空) は `DEFAULT_POSITION` で補う
 * - 各 actor の目標地点を浅い比較で購読するため、いずれかの actor が実際に\
 *   新しい目標を設定した場合のみ再計算される
 */
export const StageTransformProvider = (props: StageTransformProviderProps) => {
  const { children } = props

  const { actorIds } = useTimeControl03Props()

  const targets = usePlannedPathStore(
    useShallow((state) => state.getTargets(actorIds)),
  )
  const transform = useMemo(() => computeFitTransform(targets), [targets])

  return (
    <StageTransformContext.Provider value={transform}>
      {children}
    </StageTransformContext.Provider>
  )
}

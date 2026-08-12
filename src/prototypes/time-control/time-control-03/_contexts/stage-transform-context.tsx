import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { computeFitTransform, StageTransform } from '../_lib/stage-coords'
import { usePlannedPathStore } from '../_stores/planned-path'
import { DEFAULT_PLANNED_PATH } from '../_stores/planned-path/constants'
import { DEFAULT_POSITION } from '../_stores/position/constants'
import { ActorId } from '../types'

const StageTransformContext = createContext<null | StageTransform>(null)

type StageTransformProviderProps = {
  /** transform 算出対象の actor 一覧 */
  actorIds: ActorId[]
  /** transform を参照する子要素 */
  children: ReactNode
}

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
  const { actorIds, children } = props

  const targets = usePlannedPathStore(
    useShallow((state) =>
      actorIds.map((id) => {
        const path = state.plannedPathById[id] ?? DEFAULT_PLANNED_PATH

        return path[path.length - 1] ?? DEFAULT_POSITION
      }),
    ),
  )
  const transform = useMemo(() => computeFitTransform(targets), [targets])

  return (
    <StageTransformContext.Provider value={transform}>
      {children}
    </StageTransformContext.Provider>
  )
}

/** 現在の stage transform を取得する */
export const useStageTransform = (): StageTransform => {
  const transform = useContext(StageTransformContext)

  if (transform === null) {
    throw new Error(
      'useStageTransform should be used within <StageTransformProvider>',
    )
  }

  return transform
}

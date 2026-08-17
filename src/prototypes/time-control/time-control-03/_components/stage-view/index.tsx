import { STAGE_SIZE } from '../../_lib/stage-coords'
import { useTimeControl03Props } from '../../index.contexts'

import { CurrentPositionMarker } from './_components/current-position-marker'
import { PlannedPathMarker } from './_components/planned-path-marker'

/**
 * actor の座標を CSS の絶対位置で表現する stage
 *
 * - 全 actor の bounding box 中心を原点、収まる scale で表示する\
 *   (stage transform、`_computed` 経由)
 * - 現在位置 (`CurrentPositionMarker`) と予定位置 (`PlannedPathMarker`) を別コンポーネントに\
 *   分離し、`set target` (企図) では予定位置のみ、行動決定では現在位置のみが\
 *   再レンダリングされるようにする
 */
export const StageView = () => {
  const { actorIds } = useTimeControl03Props()

  return (
    <div
      className="relative border border-solid border-gray-300 bg-gray-50"
      style={{ height: STAGE_SIZE, width: STAGE_SIZE }}
    >
      {actorIds.map((id) => (
        <PlannedPathMarker id={id} key={`planned-${id}`} />
      ))}
      {actorIds.map((id) => (
        <CurrentPositionMarker id={id} key={`current-${id}`} />
      ))}
    </div>
  )
}

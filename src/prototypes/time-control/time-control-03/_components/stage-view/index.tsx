import { StageTransformProvider } from '../../_contexts/stage-transform-context'
import { STAGE_SIZE } from '../../_lib/stage-coords'
import { ActorId } from '../../types'
import { CurrentPositionMarker } from '../current-position-marker'
import { PlannedPathMarker } from '../planned-path-marker'

type StageViewProps = {
  /** 表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * actor の座標を CSS の絶対位置で表現する stage
 *
 * - 全 actor の bounding box 中心を原点、収まる scale で表示する (`StageTransformProvider`)
 * - 現在位置 (`CurrentPositionMarker`) と予定位置 (`PlannedPathMarker`) を別コンポーネントに\
 *   分離し、`set target` (企図) では予定位置のみ、行動決定では現在位置のみが\
 *   再レンダリングされるようにする
 */
export const StageView = (props: StageViewProps) => {
  const { actorIds } = props

  return (
    <StageTransformProvider actorIds={actorIds}>
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
    </StageTransformProvider>
  )
}

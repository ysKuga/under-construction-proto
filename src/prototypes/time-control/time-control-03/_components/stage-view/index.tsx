import { STAGE_SIZE } from '../../../time-control-02/_lib/stage-coords'
import { ActorId } from '../../types'
import { ActorMarker } from '../actor-marker'

type StageViewProps = {
  /** 表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * actor の座標を CSS の絶対位置で表現する stage
 *
 * - Position { x: 0, y: 0 } を中央に、y 下向きの screen 座標系のまま `top`/`left` に対応させる
 * - 現在位置に加え、残り経路 (`pathById`) の各点も表示する
 */
export const StageView = (props: StageViewProps) => {
  const { actorIds } = props

  return (
    <div
      className="relative border border-solid border-gray-300 bg-gray-50"
      style={{ height: STAGE_SIZE, width: STAGE_SIZE }}
    >
      {actorIds.map((id) => (
        <ActorMarker id={id} key={id} />
      ))}
    </div>
  )
}

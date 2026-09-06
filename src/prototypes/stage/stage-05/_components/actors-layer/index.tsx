import { Robot01 } from '@/components/samples/figure/robot-01'
import { cn } from '@/utils/cn'

import { getNextSequentialPosition } from '../../../stage-04/_components/actors-layer'
import {
  useActorControl,
  useActorPosition,
} from '../../../stage-04/_contexts/actor-position-context'
import { useKeyboardMove } from '../../../stage-04/_hooks/use-keyboard-move'
import { PerspectiveViewport, projectCell } from '../../_lib/perspective'

type ActorsLayerProps = {
  /** 遠近投影のレイアウト指定 */
  viewport: PerspectiveViewport
}

/**
 * actor 表示 (遠近付き)
 *
 * - クリックで次セルへ順送り、キーボードで方向移動 (stage-04 の操作系を流用)
 * - actor の大きさは現在行の縮尺に追従する
 * - 複数 actor / 障害物との前後関係 (row 昇順ソート) は段階 4 で対応
 */
export const ActorsLayer = (props: ActorsLayerProps) => {
  const { viewport } = props

  const { dispatchMoveIntent, gridSize } = useActorControl()
  const actorPosition = useActorPosition()

  useKeyboardMove()

  const { left, size, top } = projectCell(actorPosition, gridSize, viewport)

  const handleClick = () => {
    dispatchMoveIntent({
      source: 'actor-click',
      target: getNextSequentialPosition(actorPosition, gridSize),
    })
  }

  return (
    <button onClick={handleClick} type="button">
      <Robot01
        className={cn('ui-cell', 'absolute')}
        key={`${actorPosition.row}-${actorPosition.col}`}
        style={{ height: size, left, top }}
      />
    </button>
  )
}

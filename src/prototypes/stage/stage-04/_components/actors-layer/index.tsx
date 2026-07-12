import { useMemo } from 'react'

import { Robot01 } from '@/components/samples/figure/robot-01'
import { cn } from '@/utils/cn'

import {
  GridPosition,
  GridSize,
  useActorPosition,
} from '../../_contexts/actor-position-context'
import { useKeyboardMove } from '../../_hooks/use-keyboard-move'

type ActorsLayerProps = {
  /** scale による大きさの指定 */
  scale: number
}

/**
 * 「クリックで次セルへ順送り」方式の次ターゲット座標を算出する
 * - 右へ1マス、右端なら次行の左端へ折り返す
 * - 右下端であれば (0, 0) へ戻る
 */
const getNextSequentialPosition = (
  current: GridPosition,
  gridSize: GridSize,
): GridPosition => {
  const isLastCol = current.col >= gridSize.cols - 1

  return {
    col: isLastCol ? 0 : current.col + 1,
    row: isLastCol
      ? current.row >= gridSize.rows - 1
        ? 0
        : current.row + 1
      : current.row,
  }
}

/**
 * actor 表示
 *
 * - クリックで次セルへの順送り移動、キーボードでの方向移動に対応
 */
export const ActorsLayer = (props: ActorsLayerProps) => {
  const { scale } = props

  const { dispatchMoveIntent, gridSize, position } = useActorPosition()

  useKeyboardMove()

  const cellScale = useMemo(() => {
    return scale / gridSize.cols
  }, [scale, gridSize.cols])

  const handleClick = () => {
    dispatchMoveIntent({
      source: 'actor-click',
      target: getNextSequentialPosition(position, gridSize),
    })
  }

  return (
    <button onClick={handleClick} type="button">
      <Robot01
        className={cn('ui-cell', 'absolute', 'top-0')}
        key={`${position.row}-${position.col}`}
        style={{
          height: cellScale,
          left: cellScale * position.col,
          top: cellScale * position.row,
        }}
      />
    </button>
  )
}

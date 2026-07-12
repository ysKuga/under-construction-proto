import { useMemo } from 'react'

import { StyledDiv } from '@/components/samples/_parts/_base/part-base'
import { cn } from '@/utils/cn'

import { useActorPosition } from '../../_contexts/actor-position-context'

type GeoLayerProps = {
  /** scale による大きさの指定 */
  scale: number
}

/**
 * 地形 layer
 *
 * - 各セルをクリックすると、そのセルへの移動企図イベントを発生させる
 * - actor が乗っているセルは actor 側のボタンがクリックを受け取るため、
 *   そのセルへの cell-click は事実上発生しない
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const { scale } = props

  const { dispatchMoveIntent, gridSize } = useActorPosition()

  const cellScale = useMemo(() => {
    return scale / gridSize.cols
  }, [scale, gridSize.cols])

  return (
    <>
      {Array.from({ length: gridSize.rows }).map((_, row) => {
        return Array.from({ length: gridSize.cols }).map((_, col) => {
          return (
            <button
              className={cn(
                'ui-cell',
                'absolute',
                'top-0',
                'aspect-square',
                'border-0',
                'bg-transparent',
                'p-0',
              )}
              key={`${row}-${col}`}
              onClick={() => {
                dispatchMoveIntent({
                  source: 'cell-click',
                  target: { col, row },
                })
              }}
              style={{
                height: cellScale,
                left: cellScale * col,
                top: cellScale * row,
              }}
              type="button"
            >
              <StyledDiv className={cn('h-full', 'w-full')}>&nbsp;</StyledDiv>
            </button>
          )
        })
      })}
    </>
  )
}

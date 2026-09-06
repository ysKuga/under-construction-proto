import { StyledDiv } from '@/components/samples/_parts/_base/part-base'
import { cn } from '@/utils/cn'

import { useActorControl } from '../../../stage-04/_contexts/actor-position-context'
import { PerspectiveViewport, projectCell } from '../../_lib/perspective'

type GeoLayerProps = {
  /** 遠近投影のレイアウト指定 */
  viewport: PerspectiveViewport
}

/**
 * 地形 layer (遠近付き)
 *
 * - 各セルをクリックすると、そのセルへの移動企図イベントを発生させる
 * - 奥の行から順に描画し、手前のセルを DOM 上で後勝ちにする (z-index 不要)
 */
export const GeoLayer = (props: GeoLayerProps) => {
  const { viewport } = props

  const { dispatchMoveIntent, gridSize } = useActorControl()

  return (
    <>
      {Array.from({ length: gridSize.rows }).map((_, row) =>
        Array.from({ length: gridSize.cols }).map((_, col) => {
          const { left, size, top } = projectCell(
            { col, row },
            gridSize,
            viewport,
          )

          return (
            <button
              className={cn(
                'ui-cell',
                'absolute',
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
              style={{ height: size, left, top, width: size }}
              type="button"
            >
              <StyledDiv className={cn('h-full', 'w-full')}>&nbsp;</StyledDiv>
            </button>
          )
        }),
      )}
    </>
  )
}

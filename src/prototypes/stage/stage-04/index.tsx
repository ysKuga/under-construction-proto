import { cn } from '@/utils/cn'

import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { ActorPositionProvider } from './_contexts/actor-position-context'

type Stage04Props = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
  /** scale による大きさの指定 */
  scale: number
}

/**
 * 舞台 (stage)
 *
 * - 地形 layer と actors layer を表示
 * - actor の position は ActorPositionProvider が一元管理し、
 *   キーボード / actor クリック / セルクリックのいずれも移動企図イベントの
 *   dispatch のみを行い、実際の位置反映は Provider 側に共通化する
 */
export const Stage04 = (props: Stage04Props) => {
  const { cols, rows, scale } = props

  console.log('render: Stage04')

  return (
    <ActorPositionProvider gridSize={{ cols, rows }}>
      <div
        className={cn(
          'ui-container ui-stage',
          'h-[500px] w-[500px]',
          'relative',
        )}
        style={{
          height: scale,
          width: scale,
        }}
      >
        <GeoLayer scale={scale} />
        <ActorsLayer scale={scale} />
      </div>
    </ActorPositionProvider>
  )
}

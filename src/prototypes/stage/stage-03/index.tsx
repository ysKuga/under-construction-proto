import { PropsWithChildren, useMemo } from 'react'

import { StyledDiv } from '@/components/samples/_parts/_base/part-base'
import { cn } from '@/utils/cn'

import { ActorsLayer } from './_components/actors-layer'

type Stage03Props = PropsWithChildren<{
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
  /** scale による大きさの指定 */
  scale: number
}>

/**
 * 舞台 (stage)
 *
 * - 地形 layer と actors layer を表示
 * - actors の挙動により再レンダリングを回避するため useMemo を使用してみる
 * - children については actors layer を children に指定する試行時で使用
 *   - devtools での render の highlight での確認で memo が効いていないように思われた
 *   - 一応 console.log について memo の効果が確認されたためいったんよしとする
 */
export const Stage03 = (props: Stage03Props) => {
  const { children, cols, rows, scale } = props

  const cellScale = useMemo(() => {
    return scale / cols
  }, [scale, cols])

  /**
   * 地形 layer
   */
  const memoizedGeoLayer = useMemo(() => {
    console.log('memoizedGeoLayer')
    return (
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
        {Array.from({ length: rows }).map((_, row) => {
          return Array.from({ length: cols }).map((_, col) => {
            return (
              <StyledDiv
                className={cn(
                  'ui-cell',
                  'absolute',
                  'top-0',
                  'aspect-square',
                  'bg-white',
                )}
                key={`${row}-${col}`}
                style={{
                  height: cellScale,
                  left: cellScale * col,
                  top: cellScale * row,
                }}
              >
                &nbsp;
              </StyledDiv>
            )
          })
        })}
      </div>
    )
  }, [cellScale, cols, rows, scale])

  /** actors layer */
  const memoizedActorsLayer = useMemo(() => {
    console.log('memoizedActorsLayer')
    return <ActorsLayer cols={cols} scale={scale} />
  }, [cols, scale])

  const memoizedChildren = useMemo(() => children, [children])

  return (
    <>
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
        {memoizedGeoLayer}
        {memoizedActorsLayer}
        {memoizedChildren}
      </div>
    </>
  )
}

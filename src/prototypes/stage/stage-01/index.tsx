import { useMemo } from 'react'

import { Robot01 } from '@/components/samples/figure/robot-01'
import { cn } from '@/utils/cn'

type Stage01Props = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/**
 * 舞台 (stage)
 *
 * - 単純な四角で表現する
 */
export const Stage01 = (props: Stage01Props) => {
  const { cols, rows } = props

  /**
   * 表示する要素を 2 次元の配列で保持する
   * - row: 1 次の index
   * - col: 2 次の value
   */
  const grid = useMemo(() => {
    return Array.from({ length: rows }).map(() => {
      return Array.from({ length: cols }).map(() => ({
        children: (
          <>
            <Robot01 />
          </>
        ),
      }))
    })
  }, [cols, rows])

  const scale = 500

  const cellScale = useMemo(() => {
    return scale / cols
  }, [scale, cols])

  return (
    <div
      className={cn(
        'ui-container ui-stage',
        'h-[500px] w-[500px]',
        'flex flex-col',
      )}
      style={{
        height: scale,
        width: scale,
      }}
    >
      {grid.map((cols, row) => {
        return (
          <div
            className={cn('ui-row', 'flex')}
            key={row}
            style={{
              height: cellScale,
            }}
          >
            {cols.map(({ children }, col) => {
              return (
                <div
                  className="ui-col"
                  key={col}
                  style={{
                    width: cellScale,
                  }}
                >
                  {children}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

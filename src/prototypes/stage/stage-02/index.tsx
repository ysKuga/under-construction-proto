import { Fragment, useMemo } from 'react'

import { Robot01 } from '@/components/samples/figure/robot-01'
import { cn } from '@/utils/cn'

type Stage02Props = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/**
 * 舞台 (stage)
 *
 * - 単純な四角で表現する
 * - Stage01 では cols が rows の入れ子になっていたところレンダリングとしては 1 次元にしている
 * - 今後の展開として layer を分割して cols, rows は cells の情報として扱うようにする
 */
export const Stage02 = (props: Stage02Props) => {
  const { cols, rows } = props

  const scale = 500

  const cellScale = useMemo(() => {
    return scale / cols
  }, [scale, cols])

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
            <Robot01
              style={{
                height: cellScale,
              }}
            />
          </>
        ),
      }))
    })
  }, [cols, rows, cellScale])

  return (
    <div
      className={cn('ui-container ui-stage', 'h-[500px] w-[500px]', 'relative')}
      style={{
        height: scale,
        width: scale,
      }}
    >
      {grid.map((cols, row) => {
        return cols.map(({ children }, col) => {
          return (
            <div
              className={cn('ui-cell', 'absolute', 'top-0')}
              key={`${row}-${col}`}
              style={{
                height: cellScale,
                left: cellScale * col,
                top: cellScale * row,
              }}
            >
              {children}
            </div>
          )
        })
      })}
    </div>
  )
}

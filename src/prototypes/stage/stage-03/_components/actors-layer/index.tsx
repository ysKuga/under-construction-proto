import { useMemo, useState } from 'react'

import { Robot01 } from '@/components/samples/figure/robot-01'
import { cn } from '@/utils/cn'

type ActorsLayerProps = {
  /** 列数 */
  cols: number
  /** scale による大きさの指定 */
  scale: number
}

/**
 * actor 表示
 *
 * - memo により囲おうとしたが、 hook を memo 配下で呼んではいけないルールに反した
 */
export const ActorsLayer = (props: ActorsLayerProps) => {
  const { cols, scale } = props

  const [col, setCol] = useState(0)
  const [row, setRow] = useState(0)

  const cellScale = useMemo(() => {
    return scale / cols
  }, [scale, cols])

  const handleClick = () => {
    const colLimit = cols - 1

    /**
     * 行数
     * - cols と同一のためそのまま代入
     * - rows がないと誤解を生むため用意
     */
    const rows = cols
    const rowLimit = rows - 1

    // 横方向への移動
    setCol((prev) => (col < colLimit ? prev + 1 : 0))

    // 縦方向への移動
    if (col === colLimit) {
      setRow((prev) => (row < rowLimit ? prev + 1 : 0))
    }
  }

  return (
    <button onClick={handleClick} type="button">
      <Robot01
        className={cn('ui-cell', 'absolute', 'top-0')}
        key={`${row}-${col}`}
        style={{
          height: cellScale,
          left: cellScale * col,
          top: cellScale * row,
        }}
      />
    </button>
  )
}

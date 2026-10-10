import { useRef, useState } from 'react'

import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { isSameCell } from '../../../../../../../_lib/is-same-cell'
import { UseCellInfoPanelReturn } from '../index.types'

/** 同じセル（どちらも hover なしを含む）か */
const isSameHoveredCell = (
  a: HexCell | undefined,
  b: HexCell | undefined,
): boolean => (a && b ? isSameCell(a, b) : a === b)

/**
 * hover 中のセルを `Stage07-cell-hover` から state で保持する
 *
 * - パネルの JSX 構造（一覧の要素数）が hover 中セルで変わるため state で持つ\
 *   （docs/performance/high-frequency-display「ゲーム内情報の表示」）
 * - 同じセルなら `setState` を呼ばない。updater で前の値を返す形では、React が\
 *   bailout 前に1度描画する場合があるため、前回値を ref で比べる
 */
export const useHoveredCell = (): Pick<
  UseCellInfoPanelReturn,
  'hoveredCell'
> => {
  const [hoveredCell, setHoveredCell] = useState<HexCell | undefined>()
  /** 最後に state へ反映した hover 中セル */
  const lastHoveredCellRef = useRef<HexCell | undefined>(undefined)

  useStage07EventListener('Stage07-cell-hover', (event) => {
    const { cell } = event.detail

    // 同じセル: 再レンダリングさせない
    if (isSameHoveredCell(lastHoveredCellRef.current, cell)) {
      return
    }

    lastHoveredCellRef.current = cell
    setHoveredCell(cell)
  })

  return { hoveredCell }
}

import { useState } from 'react'

import { HexCell, isHexAdjacent } from '../_lib/hex'

type UseHexMoveReturn = {
  /** 現在地セル */
  currentCell: HexCell
  /** セルクリック時。隣接セルのみ移動する */
  handleCellClick: (cell: HexCell) => void
}

/**
 * hex グリッド上の現在地・隣接クリック移動を管理する
 *
 * @param initialCell 初期セル
 * @param onCellChange 現在地セル変更時（省略可）
 */
export const useHexMove = (
  initialCell: HexCell,
  onCellChange?: (cell: HexCell) => void,
): UseHexMoveReturn => {
  const [currentCell, setCurrentCell] = useState(initialCell)

  const handleCellClick = (cell: HexCell) => {
    if (!isHexAdjacent(currentCell, cell)) {
      return
    }

    setCurrentCell(cell)
    onCellChange?.(cell)
  }

  return { currentCell, handleCellClick }
}

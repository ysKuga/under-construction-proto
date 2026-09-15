import { useState } from 'react'

import { HexCell, hexDirectionToScreenAngle, isHexAdjacent } from '../_lib/hex'

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
 * @param onFacingChange 移動方向の画面角度(rad、atan2 基準)算出時（省略可）。box-bot-01 の
 *   yaw への変換・dispatch は呼び出し側(`Stage07`)が持つため、ここでは画面角度を渡すのみ
 */
export const useHexMove = (
  initialCell: HexCell,
  onCellChange?: (cell: HexCell) => void,
  onFacingChange?: (screenAngle: number) => void,
): UseHexMoveReturn => {
  const [currentCell, setCurrentCell] = useState(initialCell)

  const handleCellClick = (cell: HexCell) => {
    if (!isHexAdjacent(currentCell, cell)) {
      return
    }

    const screenAngle = hexDirectionToScreenAngle(currentCell, cell)

    if (screenAngle !== undefined) {
      onFacingChange?.(screenAngle)
    }

    setCurrentCell(cell)
    onCellChange?.(cell)
  }

  return { currentCell, handleCellClick }
}

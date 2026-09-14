import { useState } from 'react'

import { HexCell, hexDirectionToYaw, isHexAdjacent } from '../_lib/hex'

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
 * @param onFacingChange 移動方向の yaw(rad)算出時（省略可）。bot の box-bot-01 実体との\
 *   結合(`useBoxBotActionDispatcher`)は呼び出し側(`Stage07`)が持つため、ここでは角度を渡すのみ
 */
export const useHexMove = (
  initialCell: HexCell,
  onCellChange?: (cell: HexCell) => void,
  onFacingChange?: (yaw: number) => void,
): UseHexMoveReturn => {
  const [currentCell, setCurrentCell] = useState(initialCell)

  const handleCellClick = (cell: HexCell) => {
    if (!isHexAdjacent(currentCell, cell)) {
      return
    }

    const yaw = hexDirectionToYaw(currentCell, cell)

    if (yaw !== undefined) {
      onFacingChange?.(yaw)
    }

    setCurrentCell(cell)
    onCellChange?.(cell)
  }

  return { currentCell, handleCellClick }
}

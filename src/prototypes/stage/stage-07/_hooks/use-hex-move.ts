import { HexCell, hexDirectionToScreenAngle, isHexAdjacent } from '../_lib/hex'

type UseHexMoveReturn = {
  /** セルクリック時。隣接セルのみ移動する */
  handleCellClick: (cell: HexCell) => void
}

/**
 * hex グリッド上の隣接クリック移動を管理する
 *
 * - 現在セルは `ActorNodeRegistryProvider` が保持する（`Stage07` の外側）。ここでは
 *   クリック検証（隣接判定・進入可否）と facing 算出のみ行い、実際の位置更新は
 *   引数の `moveActor` へ委ねる
 *
 * @param currentCell 現在地セル(`useActorNodeRegistry` から取得)
 * @param moveActor 検証を通過したセルへ actor を移動する(`useActorNodeRegistry` の同名 API)
 * @param onCellChange 現在地セル変更時（省略可）
 * @param onFacingChange 移動方向の画面角度(rad、atan2 基準)算出時（省略可）。box-bot-01 の
 *   yaw への変換・dispatch は呼び出し側(`Stage07`)が持つため、ここでは画面角度を渡すのみ
 * @param canEnter 対象セルへ進入可能か（省略時は常に進入可能）。隣接判定に加えて
 *   このセルへの移動を拒否できる（find-path proto-03 の障害物セル判定等）
 */
export const useHexMove = (
  currentCell: HexCell,
  moveActor: (cell: HexCell) => void,
  onCellChange?: (cell: HexCell) => void,
  onFacingChange?: (screenAngle: number) => void,
  canEnter?: (cell: HexCell) => boolean,
): UseHexMoveReturn => {
  const handleCellClick = (cell: HexCell) => {
    if (!isHexAdjacent(currentCell, cell)) {
      return
    }

    if (canEnter && !canEnter(cell)) {
      return
    }

    const screenAngle = hexDirectionToScreenAngle(currentCell, cell)

    if (screenAngle !== undefined) {
      onFacingChange?.(screenAngle)
    }

    moveActor(cell)
    onCellChange?.(cell)
  }

  return { handleCellClick }
}

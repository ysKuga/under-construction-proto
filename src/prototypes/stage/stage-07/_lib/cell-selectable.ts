import { HexCell, isSameHexCell } from './hex'

/**
 * セルを選択可能（クリックで何かが起きる）とみなすか
 *
 * - 現在セル以外は、クリックで移動か呼び出し側の処理（目標設定等）のいずれかが起きるため全て対象
 * - 現在セルはクリックしても何もしないため除く
 * - `GeoLayer` の `cursor: pointer` と、クリックを分類する呼び出し側（find-path proto-03 の
 *   `classifyCellClick` 等）の双方がこの判定を使い、表示と挙動を揃える
 *
 * @param cell 判定対象セル
 * @param currentCell player の現在セル
 */
export const isCellSelectable = (
  cell: HexCell,
  currentCell: HexCell,
): boolean => !isSameHexCell(currentCell, cell)

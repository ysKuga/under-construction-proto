import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/** axial セルの一致判定 */
export const isSameCell = (a: HexCell, b: HexCell): boolean =>
  a.q === b.q && a.r === b.r

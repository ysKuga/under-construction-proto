import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

/** axial セルの一致判定 */
export const isSameCell = (a: HexCell, b: HexCell): boolean =>
  a.q === b.q && a.r === b.r

'use client'

import { FacingArrowCenter } from '@/components/theater/stage/spike/facing-arrow'

import { useFacingRotateRef } from './_hooks/use-facing-rotate-ref'

/**
 * ステージ上の bot の向きを示すインジケータ(issue #248)
 *
 * - 独立 bot は状態表示用に向きを変えないため、向きは別途矢印で示す
 * - 中心回転・半径端の2案を比較し、中心回転を採用した
 */
export const FacingIndicator = () => {
  const facingRotateRef = useFacingRotateRef()

  return <FacingArrowCenter ref={facingRotateRef} />
}

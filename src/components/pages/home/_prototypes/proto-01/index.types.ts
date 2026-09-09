import { UseCssToggleReturn } from '@/hooks/use-css-toggle'
import { RefObject } from 'react'

/**
 * useProto01 の戻り値
 */
export type UseProto01Return = {
  /** box-bot と共有する EventTarget */
  eventTarget: EventTarget
  /** 歩く/止まるボタンの押下ハンドラ */
  toggleWalking: () => void
  /** 歩く/止まる ラベル切替用に `data-walking` を付け外しする wrapper の ref */
  walkingRef: RefObject<HTMLDivElement | null>
  /** 歩くボタン表示制御関連 */
  walkUnlock: UseCssToggleReturn
}

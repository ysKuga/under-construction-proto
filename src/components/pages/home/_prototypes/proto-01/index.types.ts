import { UseCssToggleReturn } from '@/hooks/use-css-toggle'

/**
 * useProto01 の戻り値
 */
export type UseProto01Return = {
  /** box-bot と共有する EventTarget */
  eventTarget: EventTarget
  /** 歩く/止まるボタンの押下ハンドラ */
  toggleWalking: () => void
  /** 歩行中か */
  walking: boolean
  /** 歩くボタン表示制御関連 */
  walkUnlock: UseCssToggleReturn
}

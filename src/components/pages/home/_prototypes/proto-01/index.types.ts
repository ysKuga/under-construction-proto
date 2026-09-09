import type { RefObject } from 'react'

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
  /** 歩くボタン解放を表す hidden checkbox の ref（解放で checked を直書き） */
  walkUnlockedRef: RefObject<HTMLInputElement | null>
}

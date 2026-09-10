import type { ReactElement } from 'react'

/**
 * useProto01 の戻り値
 */
export type UseProto01Return = {
  /** box-bot と共有する EventTarget */
  eventTarget: EventTarget
  /** 歩く/止まるボタンの押下ハンドラ */
  toggleWalking: () => void
  /** 歩くボタンの表示制御 className（解放状態で表示、以外は非表示） */
  walkButtonClassName: string
  /** 歩行中か */
  walking: boolean
  /** 歩くボタン解放を表す hidden checkbox 要素（解放で checked を直書き） */
  walkUnlockedCheckbox: ReactElement
}
